import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { guidanceReply, uid } from "@/lib/edupath";
import type { AcademicContext } from "@/lib/gemini";
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

function Ask() {
  const { state, update } = useStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeAcademicContext, setIncludeAcademicContext] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [state.chat.length, loading]);

  const send = async (q: string) => {
    if (!q.trim() || loading) return;
    const userText = q.trim();
    setText("");
    update((s) => ({ ...s, chat: [...s.chat, { id: uid(), role: "user", text: userText }] }));
    setLoading(true);

    try {
      const profile = state.profile;
      const academicContext: AcademicContext = {
        ...(profile
          ? {
              profile: {
                course: profile.course,
                branch: profile.branch,
                year: profile.year,
                interests: profile.interests,
                strengths: profile.strengths,
                career: profile.career,
              },
            }
          : {}),
        subjects: state.subjects.map((subject) => ({
          name: subject.name,
          topics: subject.topics.map((topic) => ({ name: topic.name, score: topic.score })),
        })),
        pendingTasks: state.tasks
          .filter((task) => !task.done)
          .slice(0, 8)
          .map(({ day, title, minutes }) => ({ day, title, minutes })),
      };
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: userText,
          includeAcademicContext,
          academicContext: includeAcademicContext ? academicContext : undefined,
        }),
      });
      const payload: unknown = await response.json().catch(() => undefined);
      const data = payload as
        | {
            reply?: unknown;
            error?: { code?: unknown; message?: unknown };
          }
        | undefined;

      if (response.ok && typeof data?.reply === "string" && data.reply.trim()) {
        update((s) => ({
          ...s,
          chat: [...s.chat, { id: uid(), role: "bot", text: data.reply as string }],
        }));
        return;
      }

      const fallback = await guidanceReply(userText, state);
      const note =
        typeof data?.error?.message === "string"
          ? data.error.message
          : "Gemini could not answer, so this reply uses EduPath's built-in guidance.";
      update((s) => ({
        ...s,
        chat: [...s.chat, { id: uid(), role: "bot", text: `${fallback}\n\nGemini: ${note}` }],
      }));
    } catch {
      const fallback = await guidanceReply(userText, state);
      update((s) => ({
        ...s,
        chat: [
          ...s.chat,
          {
            id: uid(),
            role: "bot",
            text: `${fallback}\n\nGemini is unavailable, so this reply uses EduPath's built-in guidance.`,
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ask EduPath Assistant"
        sub="Ask Gemini for study and career guidance. EduPath's built-in guidance is available when Gemini is not configured."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkles className="size-3 text-primary" /> Gemini AI when configured
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
          <div className="mb-4 rounded-lg border bg-secondary/30 p-3">
            <label className="flex cursor-pointer items-start gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="mt-0.5 accent-primary"
                checked={includeAcademicContext}
                onChange={(event) => setIncludeAcademicContext(event.target.checked)}
              />
              <span>Personalize answers with my saved study data</span>
            </label>
            <p className="mt-1 pl-6 text-xs leading-relaxed text-muted-foreground">
              When Gemini is configured, your question is sent to Google. When checked, EduPath also
              sends your course, branch, year, interests, strengths, career preference, topic
              scores, and unfinished roadmap tasks. Your name, email, and login credentials are
              excluded.
            </p>
          </div>
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
