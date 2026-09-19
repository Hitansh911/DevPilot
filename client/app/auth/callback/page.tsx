"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useCurrentUser } from "@/hooks/use-auth";

// Ensures the rocket animation is visible for at least one full pass,
// even if auth resolves almost instantly (e.g. from cache).
const MIN_DISPLAY_MS = 1800;

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: user, isLoading, isError, isFetched } = useCurrentUser();
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!isFetched || isLoading) return;

    // Same destinations, same conditions as before — only difference is
    // the redirect now waits out the remainder of MIN_DISPLAY_MS instead
    // of firing the instant auth resolves.
    const destination = user ? "/dashboard" : "/login?error=session";
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0);

    const timer = setTimeout(() => {
      router.replace(destination);
    }, remaining);

    return () => clearTimeout(timer);
  }, [user, isLoading, isFetched, isError, router]);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-[#05050b]">
      {/* Starfield backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 60%, white, transparent), radial-gradient(1.5px 1.5px at 40% 80%, white, transparent), radial-gradient(1px 1px at 85% 20%, white, transparent), radial-gradient(1.5px 1.5px at 55% 45%, white, transparent), radial-gradient(1px 1px at 10% 70%, white, transparent), radial-gradient(1px 1px at 90% 85%, white, transparent), radial-gradient(1.5px 1.5px at 30% 15%, white, transparent), radial-gradient(1px 1px at 60% 10%, white, transparent), radial-gradient(1px 1px at 15% 55%, white, transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "320px 320px",
          opacity: 0.6,
        }}
      />

      {/* Rocket launching straight up from bottom-center, looping */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rocket-launch absolute">
          <div className="relative flex flex-col items-center">
            {/* Colorful exhaust — layered blurred puffs, orange/red near
                the nozzle fading out to purple/pink further down, each
                puffing independently for a flickering, "alive" trail. */}
            <div className="exhaust pointer-events-none absolute left-1/2 top-full -translate-x-1/2">
              <span className="puff puff-1" />
              <span className="puff puff-2" />
              <span className="puff puff-3" />
              <span className="puff puff-4" />
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rocket.png"
              alt=""
              className="relative z-10 select-none"
              style={{
                width: "clamp(90px, 14vw, 260px)",
                height: "auto",
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-white/80">
          Finishing GitHub sign-in…
        </p>
      </div>

      <style jsx>{`
        .rocket-launch {
          left: 50%;
          bottom: -25%;
          transform: translateX(-50%);
          animation: rocket-fly-up 2.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes rocket-fly-up {
          0% {
            bottom: -25%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            bottom: 115%;
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rocket-launch {
            animation: none;
            bottom: 40%;
            opacity: 1;
          }
        }

        .puff {
          position: absolute;
          left: 50%;
          border-radius: 9999px;
          filter: blur(10px);
          transform: translate(-50%, 0) scale(0.6);
          animation: puff-rise 1.1s ease-out infinite;
        }
        .puff-1 {
          top: 0;
          width: clamp(28px, 4.5vw, 80px);
          height: clamp(28px, 4.5vw, 80px);
          background: radial-gradient(circle, #fbbf24, transparent 70%);
          animation-delay: 0s;
        }
        .puff-2 {
          top: 8px;
          width: clamp(36px, 5.5vw, 100px);
          height: clamp(36px, 5.5vw, 100px);
          background: radial-gradient(circle, #f97316, transparent 70%);
          animation-delay: 0.15s;
          opacity: 0.85;
        }
        .puff-3 {
          top: 20px;
          width: clamp(44px, 6.5vw, 120px);
          height: clamp(44px, 6.5vw, 120px);
          background: radial-gradient(circle, #ec4899, transparent 70%);
          animation-delay: 0.3s;
          opacity: 0.7;
        }
        .puff-4 {
          top: 36px;
          width: clamp(52px, 7.5vw, 140px);
          height: clamp(52px, 7.5vw, 140px);
          background: radial-gradient(circle, #8b5cf6, transparent 70%);
          animation-delay: 0.45s;
          opacity: 0.55;
        }
        @keyframes puff-rise {
          0% {
            transform: translate(-50%, 0) scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, 46px) scale(1.5);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .puff {
            animation: none;
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}