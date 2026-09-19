package DevPilot.backend.services.ai;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import DevPilot.backend.dto.ChatMessageResponse;
import DevPilot.backend.dto.CitationDto;
import DevPilot.backend.entity.ChatMessage;
import DevPilot.backend.entity.MessageRole;
import DevPilot.backend.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * Generation step: call Hugging Face's OpenAI-compatible chat completions
 * endpoint directly via WebClient and stream tokens to the browser over SSE.
 */
@Component
@Slf4j
public class ChatStreamHandler {

    private final WebClient webClient;
    private final ChatMessageRepository chatMessageRepository;
    private final CitationMapper citationMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.chat.model:mistralai/Mistral-7B-Instruct-v0.3}")
    private String model;

    public ChatStreamHandler(
            @Value("${huggingface.api-key}") String apiKey,
            ChatMessageRepository chatMessageRepository,
            CitationMapper citationMapper) {
        this.webClient = WebClient.builder()
                .baseUrl("https://router.huggingface.co/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
        this.chatMessageRepository = chatMessageRepository;
        this.citationMapper = citationMapper;
    }

    public SseEmitter stream(
            UUID sessionId,
            ChatMessageResponse savedUserMessage,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt) {

        log.info(">>> ChatStreamHandler.stream() called for session {}", sessionId);

        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();

        try {
            emitter.send(SseEmitter.event()
                    .name("user_message")
                    .data(savedUserMessage));

            Map<String, Object> body = Map.of(
                    "model", model,
                    "stream", true,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ));

            webClient.post()
                    .uri("/chat/completions")
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(status -> status.value() >= 400, response ->
                            response.bodyToMono(String.class)
                                    .doOnNext(errorBody -> log.error("HF error response: {}", errorBody))
                                    .map(errorBody -> new RuntimeException("HF API error: " + errorBody)))
                    .bodyToFlux(String.class)
                    .doOnNext(chunk -> {
                        log.info("RAW CHUNK (unfiltered): [{}]", chunk);
                        handleChunk(emitter, fullReply, chunk);
                    })
                    .doOnError(err -> {
                        log.error("Chat stream error", err);
                        emitter.completeWithError(err);
                    })
                    .doOnComplete(() -> completeStream(emitter, sessionId, fullReply, citations))
                    .subscribe();
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    /**
     * Hugging Face's router returns OpenAI-style SSE lines:
     * "data: {"choices":[{"delta":{"content":"..."}}]}"
     * ending with "data: [DONE]".
     */
    private void handleChunk(SseEmitter emitter, StringBuilder fullReply, String rawChunk) {
    String payload = rawChunk.trim();
    if (payload.isEmpty() || payload.equals("[DONE]")) {
        return;
    }
    try {
        JsonNode root = objectMapper.readTree(payload);
        JsonNode delta = root.path("choices").path(0).path("delta");
        String token = delta.path("content").asText(null);
        if (token != null && !token.isEmpty()) {
            appendToken(emitter, fullReply, token);
        }
    } catch (Exception ex) {
        log.warn("Skipping malformed chunk: {}", payload, ex);
    }
}

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        fullReply.append(token);
        try {
            emitter.send(SseEmitter.event()
                    .name("token")
                    .data(token, MediaType.APPLICATION_JSON));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private void completeStream(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations) {
        try {
            ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT)
                    .content(fullReply.toString())
                    .citations(citationMapper.toJson(citations))
                    .build());

            emitter.send(SseEmitter.event()
                    .name("assistant_message")
                    .data(toMessageResponse(assistant)));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                citationMapper.fromJson(message.getCitations()),
                message.getCreatedAt());
    }
}