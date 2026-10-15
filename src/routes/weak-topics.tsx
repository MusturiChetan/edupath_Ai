import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, Target, Trash2, Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell, Empty, NeedsProfile, PageHeader, Panel, StatusBadge } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { generateTasks, subjectAverage, topicStatus, uid, weakTopics } from "@/lib/edupath";

export const Route = createFileRoute("/weak-topics")({
  head: () => meta("Weak Topic Analysis — EduPath AI", "See which topics are holding you back and how to revise them."),
  component: () => <AppShell><NeedsProfile><WeakTopics /></NeedsProfile></AppShell>,
});

const COLOR = { attention: "var(--chart-5)", review: "var(--chart-4)", strong: "var(--chart-3)", nodata: "var(--border)" };

function WeakTopics() {
  const { state, update } = useStore();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [score, setScore] = useState("");
  const weak = weakTopics(state.subjects);
  const chart = state.subjects.flatMap((s) => s.topics.filter((t) => t.score !== null).map((t) => ({ name: t.name, score: t.score, status: topicStatus(t.score) })));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = score === "" ? null : Number(score);
    if (!subject.trim() || !topic.trim()) return toast.error("Enter a subject and topic");
    if (n !== null && (n < 0 || n > 100)) return toast.error("Score must be 0–100");
    update((s) => {
      const ex = s.subjects.find((x) => x.name.toLowerCase() === subject.trim().toLowerCase());
      const t = { id: uid(), name: topic.trim(), score: n };
      return { ...s, subjects: ex ? s.subjects.map((x) => x === ex ? { ...x, topics: [...x.topics, t] } : x) : [...s.subjects, { id: uid(), name: subject.trim(), topics: [t] }] };
    }, `Added score for ${topic.trim()}`);
    setTopic(""); setScore("");
    toast.success("Score added");
  };
  const setScoreFor = (sid: string, tid: string, v: string) =>
    update((s) => ({ ...s, subjects: s.subjects.map((x) => x.id !== sid ? x : { ...x, topics: x.topics.map((t) => t.id === tid ? { ...t, score: v === "" ? null : Math.max(0, Math.min(100, Number(v))) } : t) }) }));
  const remove = (sid: string, tid: string) =>
    update((s) => ({ ...s, subjects: s.subjects.map((x) => x.id !== sid ? x : { ...x, topics: x.topics.filter((t) => t.id !== tid) }).filter((x) => x.topics.length) }));
  const rebuild = () => { update((s) => ({ ...s, tasks: generateTasks(s.profile!, s.subjects) }), "Rebuilt roadmap from latest scores"); toast.success("Roadmap updated from your scores"); };

  return (
    <>
      <PageHeader title="Weak Topic Analysis" sub="Built only from scores you entered. Nothing is guessed."
        action={<Button variant="outline" onClick={rebuild}><RefreshCw /> Update roadmap</Button>} />

      <Panel className="mb-5 flex gap-3 bg-secondary text-sm">
        <Info className="size-5 shrink-0 text-primary" />
        <p><b>How topics are flagged:</b> below 50% → Needs attention · 50–69% → Review · 70%+ → Strong · blank → No data yet (not counted as weak).</p>
      </Panel>

      <form onSubmit={add} className="mb-6 grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_120px_auto]">
        <Input aria-label="Subject" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} list="subjects" />
        <datalist id="subjects">{state.subjects.map((s) => <option key={s.id} value={s.name} />)}</datalist>
        <Input aria-label="Topic" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input aria-label="Score" type="number" placeholder="Score %" value={score} onChange={(e) => setScore(e.target.value)} />
        <Button type="submit"><Plus /> Add</Button>
      </form>

      {!state.subjects.length ? (
        <Empty icon={Target} title="No scores yet" body="Add subject and topic scores above (from past tests or assignments) to see where you need to focus." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            <h2 className="mb-4 font-semibold">Topic performance</h2>
            {chart.length ? (
              <div className="h-72" role="img" aria-label="Bar chart of topic scores">
                <ResponsiveContainer>
                  <BarChart data={chart} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                    <ReferenceLine y={70} stroke="var(--chart-1)" strokeDasharray="4 4" label={{ value: "70%", fontSize: 10, position: "right" }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>{chart.map((c, i) => <Cell key={i} fill={COLOR[c.status]} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-muted-foreground">Enter at least one score to see the chart.</p>}
          </Panel>
          <Panel>
            <h2 className="mb-3 font-semibold">Needs attention</h2>
            {weak.length ? weak.map((w) => (
              <div key={w.id} className="border-b py-3 last:border-0">
                <div className="flex items-center justify-between gap-2"><p className="font-medium">{w.name}</p><StatusBadge status={topicStatus(w.score)} /></div>
                <p className="text-xs text-muted-foreground">{w.subject} · scored {w.score}%</p>
                <p className="mt-1 text-sm">{topicStatus(w.score) === "attention"
                  ? "Flagged because the score is under 50%. Revisit core concepts and worked examples before practice."
                  : "Flagged because it's between 50–69%. Solve 5–10 timed practice problems and review mistakes."}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No topics below 70%. Nice work.</p>}
          </Panel>

          {state.subjects.map((s) => {
            const avg = subjectAverage(s);
            return (
              <Panel key={s.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="text-sm text-muted-foreground">Avg {avg === null ? "—" : `${avg}%`}</span>
                </div>
                {s.topics.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 py-1.5">
                    <span className="flex-1 text-sm">{t.name}</span>
                    <StatusBadge status={topicStatus(t.score)} />
                    <Input aria-label={`${t.name} score`} type="number" className="h-8 w-20" value={t.score ?? ""} onChange={(e) => setScoreFor(s.id, t.id, e.target.value)} />
                    <Button variant="ghost" size="icon" className="size-8" aria-label={`Remove ${t.name}`} onClick={() => remove(s.id, t.id)}><Trash2 /></Button>
                  </div>
                ))}
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
