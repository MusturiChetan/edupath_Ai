import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, RefreshCw, Sun, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppShell, NeedsProfile, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { DAYS, generateTasks, uid, type Priority, type Task } from "@/lib/edupath";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => meta("Study Roadmap — EduPath AI", "Your personalised seven-day study plan linked to career skills."),
  component: () => <AppShell><NeedsProfile><Roadmap /></NeedsProfile></AppShell>,
});

const PRI: Record<Priority, string> = { High: "bg-destructive/10 text-destructive", Medium: "bg-warning/15 text-foreground", Low: "bg-muted text-muted-foreground" };
const todayIdx = () => (new Date().getDay() + 6) % 7;

function Roadmap() {
  const { state, update } = useStore();
  const [edit, setEdit] = useState<Task | null>(null);
  const done = state.tasks.filter((t) => t.done).length;
  const pct = state.tasks.length ? Math.round((done / state.tasks.length) * 100) : 0;
  const today = state.tasks.filter((t) => t.day === todayIdx());

  const toggle = (t: Task) => {
    update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) }), `${t.done ? "Reopened" : "Completed"} “${t.title}”`);
    if (!t.done) toast.success("Task complete — progress updated");
  };
  const save = (t: Task) => {
    if (!t.title.trim()) { toast.error("Task needs a title"); return; }
    update((s) => ({ ...s, tasks: s.tasks.some((x) => x.id === t.id) ? s.tasks.map((x) => x.id === t.id ? t : x) : [...s.tasks, t] }), `Saved task “${t.title}”`);
    setEdit(null); toast.success("Task saved");
  };
  const remove = (id: string) => { update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }), "Deleted a task"); setEdit(null); };

  return (
    <>
      <PageHeader title="Your 7-day roadmap" sub="Weak topics come first. Every task shows the skill or career goal it supports."
        action={<div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline"><RefreshCw /> Regenerate</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Regenerate this week?</AlertDialogTitle>
                <AlertDialogDescription>Your current tasks and their progress will be replaced with a fresh plan based on your latest scores.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { update((s) => ({ ...s, tasks: generateTasks(s.profile!, s.subjects) }), "Regenerated roadmap"); toast.success("New roadmap ready"); }}>Regenerate</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => setEdit({ id: uid(), day: todayIdx(), title: "", topic: "", minutes: 30, priority: "Medium", skill: "", done: false })}><Plus /> Add task</Button>
        </div>} />

      <div className="mb-6 grid gap-5 md:grid-cols-[1fr_1.5fr]">
        <Panel>
          <h2 className="font-semibold">Week progress</h2>
          <p className="mt-2 font-display text-3xl font-bold">{pct}%</p>
          <Progress value={pct} className="mt-2" />
          <p className="mt-2 text-sm text-muted-foreground">{done}/{state.tasks.length} tasks complete</p>
        </Panel>
        <Panel className="border-primary/30">
          <h2 className="flex items-center gap-2 font-semibold"><Sun className="size-4 text-warning" /> Today's focus · {DAYS[todayIdx()]}</h2>
          {today.length ? today.map((t) => (
            <label key={t.id} className="mt-3 flex cursor-pointer items-start gap-3">
              <Checkbox checked={t.done} onCheckedChange={() => toggle(t)} className="mt-0.5" />
              <span className={cn("text-sm", t.done && "text-muted-foreground line-through")}><b>{t.title}</b> · {t.minutes} min</span>
            </label>
          )) : <p className="mt-2 text-sm text-muted-foreground">No tasks today. Add one or enjoy a rest day.</p>}
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((d, i) => {
          const list = state.tasks.filter((t) => t.day === i);
          const mins = list.reduce((a, t) => a + t.minutes, 0);
          return (
            <Panel key={d} className={cn(i === todayIdx() && "ring-2 ring-primary/40")}>
              <div className="mb-3 flex justify-between"><h3 className="font-semibold">{d}</h3><span className="text-xs text-muted-foreground">{mins} min</span></div>
              {list.map((t) => (
                <div key={t.id} className="mb-2 rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={t.done} onCheckedChange={() => toggle(t)} aria-label={`Mark ${t.title} ${t.done ? "incomplete" : "complete"}`} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium", t.done && "text-muted-foreground line-through")}>{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.topic} · {t.minutes} min</p>
                      {t.skill && <p className="mt-1 flex items-center gap-1 text-xs text-primary"><Link2 className="size-3" />{t.skill}</p>}
                    </div>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", PRI[t.priority])}>{t.priority}</span>
                    <Button variant="ghost" size="icon" className="size-7" aria-label={`Edit ${t.title}`} onClick={() => setEdit(t)}><Pencil className="size-3.5" /></Button>
                  </div>
                </div>
              ))}
              {!list.length && <p className="text-sm text-muted-foreground">Rest day</p>}
            </Panel>
          );
        })}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{state.tasks.some((t) => t.id === edit?.id) ? "Edit task" : "Add task"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <div className="space-y-1"><Label htmlFor="t-title">Title</Label><Input id="t-title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
              <div className="space-y-1"><Label htmlFor="t-topic">Topic</Label><Input id="t-topic" value={edit.topic} onChange={(e) => setEdit({ ...edit, topic: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1"><Label htmlFor="t-day">Day</Label>
                  <select id="t-day" className="h-10 w-full rounded-md border border-input bg-card px-2 text-sm" value={edit.day} onChange={(e) => setEdit({ ...edit, day: Number(e.target.value) })}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></div>
                <div className="space-y-1"><Label htmlFor="t-min">Minutes</Label><Input id="t-min" type="number" min={5} value={edit.minutes} onChange={(e) => setEdit({ ...edit, minutes: Number(e.target.value) || 0 })} /></div>
                <div className="space-y-1"><Label htmlFor="t-pri">Priority</Label>
                  <select id="t-pri" className="h-10 w-full rounded-md border border-input bg-card px-2 text-sm" value={edit.priority} onChange={(e) => setEdit({ ...edit, priority: e.target.value as Priority })}>{["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select></div>
              </div>
              <div className="space-y-1"><Label htmlFor="t-skill">Connects to skill / goal</Label><Input id="t-skill" placeholder="e.g. Builds toward IoT Engineer" value={edit.skill} onChange={(e) => setEdit({ ...edit, skill: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {edit && state.tasks.some((t) => t.id === edit.id) && <Button variant="ghost" className="text-destructive" onClick={() => remove(edit.id)}>Delete</Button>}
            <Button onClick={() => edit && save(edit)}>Save task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
