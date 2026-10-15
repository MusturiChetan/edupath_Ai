import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { guidanceReply, uid } from "@/lib/edupath";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ask")({
  head: () => meta("Ask EduPath — EduPath AI", "Get study and career guidance based on your own profile and scores."),
  component: () => <AppShell><Ask /></AppShell>,
});

const SUGGESTED = ["What should I study next?", "How can I improve my weak topics?", "Which career suits my interests?", "Create a beginner roadmap for embedded systems.", "What should I learn this week?"];

function Ask() {
  const { state, update } = useStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [state.chat.length, loading]);

  const send = async (q: string) => {
    if (!q.trim() || loading) return;
    setText("");
    update((s) => ({ ...s, chat: [...s.chat, { id: uid(), role: "user", text: q.trim() }] }));
    setLoading(true);
    const reply = await guidanceReply(q, state);
    update((s) => ({ ...s, chat: [...s.chat, { id: uid(), role: "bot", text: reply }] }));
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Ask EduPath" sub="Built-in rule-based guidance that reads your saved profile, scores and roadmap. Not a live AI model — that's a planned integration."
        action={state.chat.length > 0 && <Button variant="outline" onClick={() => update((s) => ({ ...s, chat: [] }))}><Trash2 /> Clear chat</Button>} />
      <Panel className="flex min-h-[60vh] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {!state.chat.length && (
            <div className="py-10 text-center">
              <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-secondary text-primary"><Bot /></span>
              <p className="font-semibold">What would you like help with?</p>
              <p className="text-sm text-muted-foreground">Pick a question below or type your own.</p>
            </div>
          )}
          {state.chat.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <p className={cn("max-w-[85%] whitespace-pre-line rounded-xl px-4 py-2.5 text-sm",
                m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary")}>{m.text}</p>
            </div>
          ))}
          {loading && <div className="flex gap-1 px-2" aria-label="EduPath is typing">{[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
          <div ref={end} />
        </div>
        <div className="border-t p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => <button key={s} onClick={() => send(s)} disabled={loading} className="rounded-md border bg-card px-3 py-1.5 text-xs hover:border-primary/50 disabled:opacity-50">{s}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
            <Input aria-label="Your question" placeholder="Ask about your studies or careers…" value={text} onChange={(e) => setText(e.target.value)} />
            <Button type="submit" disabled={!text.trim() || loading} aria-label="Send"><Send /></Button>
          </form>
        </div>
      </Panel>
    </>
  );
}
