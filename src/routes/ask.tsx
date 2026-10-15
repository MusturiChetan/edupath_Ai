import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Trash2, Sparkles, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { guidanceReply, uid, weakTopics, matchCareers } from "@/lib/edupath";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ask")({
  head: () =>
    meta(
      "Ask EduPath — EduPath AI",
      "Get study and career guidance based on your own profile and scores.",
    ),
  component: () => (
    <AppShell>
      <Ask />
    </AppShell>
  ),
});

const SUGGESTED = [
  "What should I study next?",
  "How can I improve my weak topics?",
  "Which career fits my interests?",
  "Create a beginner roadmap for embedded systems.",
  "What should I learn this week?",
];

async function callGeminiIfConfigured(
  q: string,
  state: ReturnType<typeof useStore>["state"],
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) return null;

  try {
    const weak = weakTopics(state.subjects);
    const topCareers = matchCareers(state.profile, state.subjects).slice(0, 3);
    const context = `
Student Profile: ${JSON.stringify(state.profile)}
Diagnosed Weak Topics: ${JSON.stringify(weak)}
Top Career Matches: ${JSON.stringify(topCareers.map((c) => ({ title: c.career.title, points: c.points })))}
Active Roadmap Tasks: ${JSON.stringify(state.tasks.map((t) => ({ day: t.day, title: t.title, done: t.done })))}
    `;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are EduPath AI, an academic mentor for college students. Use this real student context to answer their question helpfully and concisely without making up false facts:\n${context}\n\nUser Question: ${q}`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    }
  } catch (err) {
    console.error("Gemini API call failed, falling back to rule-based engine:", err);
  }
  return null;
}

function Ask() {
  const { state, update } = useStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const hasGemini = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state.chat.length, loading]);

  const send = async (q: string) => {
    if (!q.trim() || loading) return;
    const userText = q.trim();
    setText("");
    update((s) => ({ ...s, chat: [...s.chat, { id: uid(), role: "user", text: userText }] }));
    setLoading(true);

    let reply = await callGeminiIfConfigured(userText, state);
    if (!reply) {
      reply = await guidanceReply(userText, state);
    }

    update((s) => ({ ...s, chat: [...s.chat, { id: uid(), role: "bot", text: reply! }] }));
    setLoading(false);
  };

  return (
    <>
      <PageHeader
        title="Ask EduPath Assistant"
        sub="Your personal academic guide grounded in your actual marks, weak topics, and 7-day roadmap."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {hasGemini ? (
                <>
                  <Sparkles className="size-3 text-cyan" /> Gemini Live AI Connected
                </>
              ) : (
                <>
                  <Cpu className="size-3 text-primary" /> Rule-Based Grounded Engine
                </>
              )}
            </span>
            {state.chat.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => update((s) => ({ ...s, chat: [] }))}
              >
                <Trash2 className="size-3.5 mr-1 text-muted-foreground" /> Clear chat
              </Button>
            )}
          </div>
        }
      />

      <Panel className="flex min-h-[60vh] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {!state.chat.length && (
            <div className="py-12 text-center">
              <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-card">
                <Bot className="size-6" />
              </span>
              <p className="font-semibold text-foreground text-base">How can I help you today?</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                I can explain what to study next, show your weakest topics, or suggest technical
                roadmaps tailored to your degree.
              </p>
            </div>
          )}

          {state.chat.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground shadow-sm"
                    : "rounded-bl-sm bg-secondary text-secondary-foreground border border-border/40",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div
              className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground"
              aria-label="EduPath is thinking"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-2 animate-bounce rounded-full bg-primary"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
              <span>EduPath is formulating guidance…</span>
            </div>
          )}
          <div ref={end} />
        </div>

        <div className="border-t p-4 bg-card rounded-b-xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="rounded-lg border bg-secondary/50 px-3 py-1.5 text-xs text-secondary-foreground hover:border-primary/50 hover:bg-secondary disabled:opacity-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="flex gap-2"
          >
            <Input
              aria-label="Your question"
              placeholder="Ask about your study roadmap, weak topics, or career advice…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" disabled={!text.trim() || loading} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Panel>
    </>
  );
}
