import { createFileRoute } from "@tanstack/react-router";
import { handleGeminiRequest } from "@/lib/gemini.server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestsByClient = new Map<string, number[]>();

function getClientKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "shared-client"
  ).slice(0, 96);
}

function isRateLimited(request: Request): boolean {
  const now = Date.now();
  const key = getClientKey(request);
  const recent = (requestsByClient.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestsByClient.set(key, recent);
    return true;
  }
  recent.push(now);
  requestsByClient.set(key, recent);
  if (requestsByClient.size > 500) {
    for (const [client, times] of requestsByClient) {
      if (times.every((time) => now - time >= WINDOW_MS)) requestsByClient.delete(client);
    }
  }
  return false;
}

export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            if (new URL(origin).origin !== new URL(request.url).origin) {
              return Response.json(
                {
                  error: { code: "invalid_origin", message: "This request origin is not allowed." },
                },
                { status: 403, headers: { "cache-control": "no-store" } },
              );
            }
          } catch {
            return Response.json(
              { error: { code: "invalid_origin", message: "This request origin is not allowed." } },
              { status: 403, headers: { "cache-control": "no-store" } },
            );
          }
        }

        if (isRateLimited(request)) {
          return Response.json(
            {
              error: { code: "rate_limited", message: "Please wait a minute before asking again." },
            },
            { status: 429, headers: { "cache-control": "no-store" } },
          );
        }

        return handleGeminiRequest(request);
      },
    },
  },
});
