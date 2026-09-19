# DevPilot 🚀

DevPilot is a full-stack, AI-powered developer assistant that integrates directly with your GitHub repositories. It leverages Retrieval-Augmented Generation (RAG) to allow users to have context-aware conversations with an AI about their codebase. 

By authenticating through GitHub, DevPilot indexes your repositories, converts your source code into vector embeddings, and uses advanced Language Models to answer technical questions, explain complex logic, and help you debug your code.

## 🏗️ System Architecture & Design Patterns

DevPilot is built on a decoupled, modern architecture separating the frontend client and backend API, connected via a RESTful interface.

### The RAG (Retrieval-Augmented Generation) Pipeline
The core architectural pattern of DevPilot is its RAG implementation:
1. **Indexing**: When a user selects a repository, the backend fetches the source code via the GitHub API, splits the code into manageable chunks, and sends them to **Mistral AI** to generate vector embeddings.
2. **Vector Storage**: These embeddings are stored in a **PostgreSQL** database utilizing the **PgVector** extension, which allows for rapid similarity searches.
3. **Retrieval & Generation**: When the user asks a question in the chat, the backend embeds the query, performs a Cosine Distance search against PgVector to find the most relevant code chunks, and constructs a contextual prompt. This prompt is then sent to a high-performance **Hugging Face / Groq** model to generate a streaming, context-aware response.

### Security Pattern
DevPilot uses a **Session-based OAuth2 Flow**. 
- The Spring Boot backend acts as the OAuth2 Client. 
- When a user clicks "Sign In", they are redirected to GitHub by the backend. Upon successful authorization, GitHub redirects back to the backend, which issues a secure, `HttpOnly` session cookie (`DEVPILOT_SESSION`) and redirects the user to the frontend dashboard. 
- Cross-Origin Resource Sharing (CORS) and `SameSite=None` cookie policies are configured to allow secure communication between the Vercel-hosted frontend and Railway-hosted backend.

---

## 🗂️ Core Modules & Directory Structure

### Backend (Spring Boot) - `/backend`
- **`config/`**: Configuration classes (e.g., `SecurityConfig.java` for CORS and OAuth2, application properties).
- **`controllers/`**: REST API endpoints consumed by the frontend (e.g., Auth, Chat, Repositories).
- **`entity/`**: JPA Entities (`User`, `Repository`) mapped directly to PostgreSQL tables.
- **`security/`**: Custom OAuth2 user services (`GithubOAuth2UserService.java`) that upsert users into the database upon successful GitHub login.
- **`services/ai/`**: Orchestrates the Spring AI integrations (Mistral for embeddings, Hugging Face for chat generation).
- **`services/indexing/`**: Handles the fetching, chunking, and vectorization of GitHub source code.
- **`repository/`**: Spring Data JPA interfaces for database interactions.

### Frontend (Next.js) - `/client`
- **`app/`**: Next.js App Router structure.
  - `page.tsx`: Landing page with dynamic Framer Motion animations.
  - `dashboard/`: User interface for selecting and viewing indexed GitHub repositories.
  - `chat/`: The interactive, real-time chat interface displaying streaming AI responses.
- **`components/`**: Reusable React components built with Radix UI and styled with Tailwind CSS (shadcn/ui).
- **`hooks/`**: Custom React hooks (e.g., `useCurrentUser.ts`, `useChat.ts`) utilizing React Query for server state management and caching.

---

## 💻 Technologies Utilized

### Frontend
* **Framework**: Next.js (App Router), React 19
* **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI)
* **Animations**: Framer Motion
* **State Management & Data Fetching**: TanStack React Query
* **Language**: TypeScript

### Backend
* **Framework**: Spring Boot 3.3.x (Java 22)
* **Security**: Spring Security (OAuth2 Client)
* **Data Access**: Spring Data JPA, Hibernate
* **Database Migrations**: Flyway
* **AI Orchestration**: Spring AI
* **Build Tool**: Maven

### Infrastructure & Data
* **Database**: PostgreSQL
* **Vector Store**: PgVector (enabled via Supabase/Docker)
* **AI Models**: 
  * Embeddings: Mistral AI (`mistral-embed`)
  * Chat Generation: Hugging Face API (`openai/gpt-oss-20b:groq`)
* **CI/CD**: GitHub Actions
* **Hosting**: Vercel (Frontend), Railway (Backend), Supabase (Database)

---

## 🛠️ Setup Instructions (Local Development)

### 1. Prerequisites
- **Java 22** installed.
- **Node.js 20+** installed.
- **Docker** installed and running (for local PostgreSQL).
- GitHub OAuth App created (for Client ID and Secret).
- API Keys for Mistral AI and Hugging Face.

### 2. Database Setup
At the root of the project, spin up the local PostgreSQL container (which includes the PgVector extension):
```bash
docker-compose up -d
```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a secrets configuration file: `src/main/resources/application-secrets.properties`.
3. Add the following environment variables to `application-secrets.properties`:
   ```properties
   GITHUB_OAUTH_CLIENT_ID=your_github_client_id
   GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
   MISTRAL_API_KEY=your_mistral_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   TOKEN_ENCRYPTOR_PASSWORD=a_strong_encryption_password
   TOKEN_ENCRYPTOR_SALT=a_strong_salt
   ```
4. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(The backend will start on port 8080).*

### 4. Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `client/` directory and point it to your local backend:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *(The frontend will start on port 3000).*

### 5. Access the Application
Open your browser and navigate to `http://localhost:3000`. Click "Sign In" to authenticate via GitHub and start indexing your repositories!
