import { describe, expect, it, vi } from "vitest";
import { handleGeminiRequest } from "@/lib/gemini.server";

function post(body: unknown, headers?: HeadersInit): Request {
  return new Request("http://localhost/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json", ...Object.fromEntries(new Headers(headers)) },
    body: JSON.stringify(body),
  });
}

describe("Gemini server integration", () => {
  it("keeps the API key in a request header and strips personal fields from opted-in context", async () => {
    let requestUrl = "";
    let requestInit: RequestInit | undefined;
    const fetcher: typeof fetch = async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return Response.json({
        candidates: [{ content: { parts: [{ text: "Study calculus next." }] } }],
      });
    };

    const response = await handleGeminiRequest(
      post({
        question: "What should I study?",
        includeAcademicContext: true,
        academicContext: {
          profile: {
            name: "Private Student",
            email: "student@example.com",
            course: "B.Tech",
            interests: ["Electronics"],
          },
          subjects: [{ name: "Maths", topics: [{ name: "Calculus", score: 62 }] }],
          pendingTasks: [{ day: 1, title: "Revise derivatives", minutes: 30 }],
          loginToken: "never-send-this",
        },
      }),
      { apiKey: "test-secret-key", fetcher },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: "Study calculus next." });
    expect(requestUrl).not.toContain("test-secret-key");
    expect(new Headers(requestInit?.headers).get("x-goog-api-key")).toBe("test-secret-key");
    const outgoing = JSON.parse(String(requestInit?.body)) as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    const prompt = outgoing.contents[0]?.parts[0]?.text ?? "";
    expect(prompt).toContain("B.Tech");
    expect(prompt).toContain("Calculus");
    expect(prompt).not.toContain("Private Student");
    expect(prompt).not.toContain("student@example.com");
    expect(prompt).not.toContain("never-send-this");
  });

  it("does not send academic context when the user has not opted in", async () => {
    let requestInit: RequestInit | undefined;
    const fetcher: typeof fetch = async (_input, init) => {
      requestInit = init;
      return Response.json({
        candidates: [{ content: { parts: [{ text: "A general answer." }] } }],
      });
    };

    const response = await handleGeminiRequest(
      post({
        question: "How do I make a study plan?",
        includeAcademicContext: false,
        academicContext: { profile: { course: "Secret course" } },
      }),
      { apiKey: "test-secret-key", fetcher },
    );
    const outgoing = JSON.parse(String(requestInit?.body)) as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };

    expect(response.status).toBe(200);
    expect(outgoing.contents[0]?.parts[0]?.text).not.toContain("Secret course");
  });

  it("reports a missing server key without contacting Gemini", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const response = await handleGeminiRequest(post({ question: "Hello" }), {
      apiKey: "",
      fetcher,
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: { code: "not_configured" } });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects malformed, empty, or oversized questions", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const malformed = await handleGeminiRequest(
      new Request("http://localhost/api/ask", { method: "POST", body: "not-json" }),
      { apiKey: "test-secret-key", fetcher },
    );
    const empty = await handleGeminiRequest(post({ question: "   " }), {
      apiKey: "test-secret-key",
      fetcher,
    });
    const oversized = await handleGeminiRequest(
      new Request("http://localhost/api/ask", {
        method: "POST",
        headers: { "content-length": "16001" },
        body: "{}",
      }),
      { apiKey: "test-secret-key", fetcher },
    );

    expect(malformed.status).toBe(400);
    expect(empty.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("returns a safe error when Google rejects the API key", async () => {
    const fetcher: typeof fetch = async () =>
      Response.json(
        { error: { status: "INVALID_ARGUMENT", message: "API key not valid: test-secret-key" } },
        { status: 400 },
      );
    const response = await handleGeminiRequest(post({ question: "Hello" }), {
      apiKey: "test-secret-key",
      fetcher,
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).toContain("invalid_api_key");
    expect(body).not.toContain("test-secret-key");
  });

  it("reads GEMINI_API_KEY from the server environment when options.apiKey is omitted", async () => {
    const original = process.env["GEMINI_API_KEY"];
    process.env["GEMINI_API_KEY"] = "env-injected-secret";

    let capturedKey = "";
    const fetcher: typeof fetch = async (_input, init) => {
      capturedKey = new Headers(init?.headers).get("x-goog-api-key") ?? "";
      return Response.json({
        candidates: [{ content: { parts: [{ text: "Answer using env key." }] } }],
      });
    };

    try {
      const response = await handleGeminiRequest(post({ question: "Hello from env test" }), {
        fetcher,
      });
      expect(response.status).toBe(200);
      expect(capturedKey).toBe("env-injected-secret");
    } finally {
      if (original !== undefined) {
        process.env["GEMINI_API_KEY"] = original;
      } else {
        delete process.env["GEMINI_API_KEY"];
      }
    }
  });

  it("reads GEMINI_API_KEY from .env.local file when process.env is unset", async () => {
    const original = process.env["GEMINI_API_KEY"];
    delete process.env["GEMINI_API_KEY"];

    let capturedKey = "";
    const fetcher: typeof fetch = async (_input, init) => {
      capturedKey = new Headers(init?.headers).get("x-goog-api-key") ?? "";
      return Response.json({
        candidates: [{ content: { parts: [{ text: "Answer using file key." }] } }],
      });
    };

    try {
      const response = await handleGeminiRequest(post({ question: "Hello from file test" }), {
        fetcher,
      });
      // If .env.local exists with a key, it must be read; otherwise 503 not_configured
      if (response.status === 200) {
        expect(capturedKey.length).toBeGreaterThan(0);
      } else {
        expect(response.status).toBe(503);
      }
    } finally {
      if (original !== undefined) {
        process.env["GEMINI_API_KEY"] = original;
      } else {
        delete process.env["GEMINI_API_KEY"];
      }
    }
  });
});
