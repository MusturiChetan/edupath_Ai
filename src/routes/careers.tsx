import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Info, ChevronDown, Hammer, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell, NeedsProfile, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { matchCareers, uid } from "@/lib/edupath";

export const Route = createFileRoute("/careers")({
  head: () => meta("Career Explorer — EduPath AI", "Compare career paths that fit your interests, with skills and starter projects."),
  component: () => <AppShell><NeedsProfile><Careers /></NeedsProfile></AppShell>,
});

function Careers() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = matchCareers(state.profile, state.subjects).filter(({ career: c }) =>
    (c.title + c.tags.join(" ") + c.skills.join(" ")).toLowerCase().includes(q.toLowerCase()));

  const addToPlan = (title: string, steps: string[]) => {
    update((s) => ({ ...s, tasks: [...s.tasks, ...steps.slice(0, 2).map((st, i) => ({ id: uid(), day: (i * 2 + 1) % 7, title: st, topic: title, minutes: 40, priority: "Medium" as const, skill: `Explores ${title}`, done: false }))] }), `Added ${title} steps to roadmap`);
    toast.success("Two starter steps added to your roadmap");
  };

  return (
    <>
      <PageHeader title="Career Explorer" sub="Suggestions to explore — not guarantees. No salary or placement claims." />
      <Panel className="mb-5 flex gap-3 bg-secondary text-sm">
        <Info className="size-5 shrink-0 text-primary" />
        <p><b>Demo matching rule:</b> +2 per shared interest, +1 per shared strength, +3 for your preferred direction, +1 per related subject averaging 70%+.</p>
      </Panel>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search careers" className="pl-9" placeholder="Search by career, interest or skill…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {!list.length && <p className="text-muted-foreground">No careers match “{q}”.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map(({ career: c, points, reasons }) => {
          const isOpen = open === c.id;
          return (
            <Panel key={c.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{c.title}</h2>
                <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{points} pts</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.overview}</p>
              <div className="mt-3 text-sm">
                <p className="font-medium">Why it may fit</p>
                {reasons.length ? <ul className="mt-1 list-disc pl-5 text-muted-foreground">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                  : <p className="text-muted-foreground">No overlap with your profile yet.</p>}
              </div>
              {isOpen && (
                <div className="mt-4 space-y-3 border-t pt-4 text-sm">
                  <p><b>Relevant skills:</b> {c.skills.join(", ")}</p>
                  <p><b>Learn next:</b> {c.next.join(", ")}</p>
                  <p className="flex gap-2"><Hammer className="size-4 shrink-0 text-primary" /><span><b>Beginner project:</b> {c.project}</span></p>
                  <div><b>Roadmap:</b>
                    <ol className="mt-2 flex flex-wrap gap-2">{c.roadmap.map((r, i) => <li key={r} className="rounded-md border px-2 py-1 text-xs">{i + 1}. {r}</li>)}</ol></div>
                  <Button size="sm" variant="outline" onClick={() => addToPlan(c.title, c.roadmap)}><Plus /> Add first steps to my roadmap</Button>
                </div>
              )}
              <Button variant={isOpen ? "ghost" : "default"} className="mt-4 self-start" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)}>
                {isOpen ? "Show less" : "Explore career"} <ChevronDown className={isOpen ? "rotate-180" : ""} />
              </Button>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
