import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, RotateCcw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppShell, Chip, NeedsProfile, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { CAREERS, INTERESTS, type Profile } from "@/lib/edupath";

export const Route = createFileRoute("/profile")({
  head: () => meta("Profile & Settings — EduPath AI", "Edit your interests, goals and study time, or reset demo data."),
  component: () => <AppShell><NeedsProfile><ProfilePage /></NeedsProfile></AppShell>,
});

function ProfilePage() {
  const { state, update, reset } = useStore();
  const nav = useNavigate();
  const [p, setP] = useState<Profile>(state.profile!);
  useEffect(() => setP(state.profile!), [state.profile]);
  const save = () => {
    if (!p.interests.length) { toast.error("Pick at least one interest"); return; }
    if (!p.goal.trim()) { toast.error("Goal can't be empty"); return; }
    update((s) => ({ ...s, profile: p }), "Updated profile");
    toast.success("Profile saved");
  };

  return (
    <>
      <PageHeader title="Profile & Settings" action={<Button asChild variant="outline"><Link to="/onboarding"><Pencil /> Edit full profile & scores</Link></Button>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        <Panel>
          <div className="mb-4 grid size-14 place-items-center rounded-full bg-brand font-display text-xl font-bold text-primary-foreground">{p.name[0]}</div>
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div><dt className="inline text-muted-foreground">Course: </dt><dd className="inline">{p.course} · {p.branch}</dd></div>
            <div><dt className="inline text-muted-foreground">Year: </dt><dd className="inline">{p.year}</dd></div>
            <div><dt className="inline text-muted-foreground">CGPA: </dt><dd className="inline">{p.cgpa ?? "Not provided"}</dd></div>
            <div><dt className="inline text-muted-foreground">Direction: </dt><dd className="inline">{CAREERS.find((c) => c.id === p.career)?.title ?? "Not sure yet"}</dd></div>
          </dl>
        </Panel>
        <Panel className="space-y-5">
          <div className="space-y-2"><Label>Interests</Label>
            <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <Chip key={i} active={p.interests.includes(i)} onClick={() => setP({ ...p, interests: p.interests.includes(i) ? p.interests.filter((x) => x !== i) : [...p.interests, i] })}>{i}</Chip>)}</div></div>
          <div className="space-y-2"><Label htmlFor="pgoal">Learning goal</Label><Textarea id="pgoal" value={p.goal} onChange={(e) => setP({ ...p, goal: e.target.value })} /></div>
          <div className="space-y-3"><Label>Study time per day: <span className="text-primary">{p.studyHours} h</span></Label>
            <Slider min={0.5} max={6} step={0.5} value={[p.studyHours]} onValueChange={([v]) => setP({ ...p, studyHours: v ?? 2 })} aria-label="Study hours per day" /></div>
          <Button onClick={save}>Save changes</Button>
        </Panel>
        <Panel className="flex gap-3 lg:col-span-2">
          <ShieldCheck className="size-5 shrink-0 text-success" />
          <div className="text-sm">
            <p className="font-semibold">Your data stays on this device</p>
            <p className="text-muted-foreground">Everything you enter is saved only in this browser's local storage. Nothing is sent to a server, and no AI model analyses your data. Clearing your browser data or using Reset will remove it.</p>
          </div>
        </Panel>
        <Panel className="border-destructive/30 lg:col-span-2">
          <h2 className="font-semibold">Reset demo data</h2>
          <p className="mb-4 text-sm text-muted-foreground">Clears profile, scores, roadmap, activity and chat so you can start the demo again.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive"><RotateCcw /> Reset everything</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Reset all EduPath data?</AlertDialogTitle>
                <AlertDialogDescription>This permanently deletes everything stored in this browser. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { reset(); toast.success("Demo data cleared"); nav({ to: "/" }); }}>Yes, reset</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Panel>
      </div>
    </>
  );
}
