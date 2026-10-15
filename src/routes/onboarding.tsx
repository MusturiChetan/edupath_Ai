import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Chip, Logo, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import {
  CAREERS, DEMO_PROFILE, DEMO_SUBJECTS, INTERESTS, STRENGTHS, generateTasks, uid, type Profile, type Subject,
} from "@/lib/edupath";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => meta("Get started — EduPath AI", "Tell EduPath about your studies, scores and interests to build your path."),
  component: Onboarding,
});

const STEPS = ["About you", "Scores", "Interests", "Goals"];
const blank: Profile = { name: "", course: "BTech", branch: "", year: "", cgpa: null, interests: [], strengths: [], career: "", studyHours: 2, goal: "" };

function Onboarding() {
  const { state, update } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>(state.profile ?? blank);
  const [subjects, setSubjects] = useState<Subject[]>(state.subjects.length ? state.subjects : [{ id: uid(), name: "", topics: [{ id: uid(), name: "", score: null }] }]);
  const [errors, setErrors] = useState<Errs>({});
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const toggle = (k: "interests" | "strengths", v: string) =>
    set(k, p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v]);

  const validate = () => {
    const e: Errs = {};
    if (step === 0) {
      if (!p.name.trim()) e.name = "Please enter your name";
      if (!p.branch.trim()) e.branch = "Please enter your branch";
      if (!p.year.trim()) e.year = "Please enter your year or semester";
      if (p.cgpa !== null && (p.cgpa < 0 || p.cgpa > 10)) e.cgpa = "CGPA must be between 0 and 10";
    }
    if (step === 1 && subjects.some((s) => s.topics.some((t) => t.score !== null && (t.score < 0 || t.score > 100))))
      e.scores = "Scores must be between 0 and 100";
    if (step === 2 && p.interests.length === 0) e.interests = "Pick at least one interest";
    if (step === 3 && !p.goal.trim()) e.goal = "Add a short goal, e.g. 'Pass Signals with 70%+'";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finish = () => {
    if (!validate()) return;
    const clean = subjects
      .filter((s) => s.name.trim())
      .map((s) => ({ ...s, topics: s.topics.filter((t) => t.name.trim()) }));
    update((s) => ({ ...s, profile: p, subjects: clean, tasks: generateTasks(p, clean) }), "Generated a new EduPath");
    toast.success("Your EduPath is ready");
    nav({ to: "/dashboard" });
  };

  const loadDemo = () => {
    update((s) => ({ ...s, profile: DEMO_PROFILE, subjects: DEMO_SUBJECTS, tasks: generateTasks(DEMO_PROFILE, DEMO_SUBJECTS) }), "Loaded demo student");
    toast.success("Demo student loaded");
    nav({ to: "/dashboard" });
  };

  const setTopic = (si: number, ti: number, patch: Partial<Subject["topics"][number]>) =>
    setSubjects((ss) => ss.map((s, i) => i !== si ? s : { ...s, topics: s.topics.map((t, j) => j === ti ? { ...t, ...patch } : t) }));

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <Button variant="ghost" size="sm" onClick={loadDemo}>Skip — use demo student</Button>
      </div>

      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
            <p className={cn("mt-2 text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>{i + 1}. {s}</p>
          </li>
        ))}
      </ol>

      <Panel className="space-y-5">
        {step === 0 && (<>
          <h1 className="text-xl font-bold">Tell us about you</h1>
          <Field label="Name" error={errors.name}><Input id="name" value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <div className="space-y-2">
            <Label>Course</Label>
            <div className="flex flex-wrap gap-2">{["BTech", "Degree", "Diploma", "Other"].map((c) => <Chip key={c} active={p.course === c} onClick={() => set("course", c)}>{c}</Chip>)}</div>
          </div>
          <Field label="Branch / specialization" error={errors.branch}><Input id="branch" placeholder="e.g. Electronics & Communication" value={p.branch} onChange={(e) => set("branch", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Year or semester" error={errors.year}><Input id="year" placeholder="e.g. 3rd year · Sem 5" value={p.year} onChange={(e) => set("year", e.target.value)} /></Field>
            <Field label="CGPA (optional)" error={errors.cgpa}><Input id="cgpa" type="number" step="0.1" placeholder="Leave blank if unsure" value={p.cgpa ?? ""} onChange={(e) => set("cgpa", e.target.value === "" ? null : Number(e.target.value))} /></Field>
          </div>
        </>)}

        {step === 1 && (<>
          <div>
            <h1 className="text-xl font-bold">Subject & topic scores</h1>
            <p className="text-sm text-muted-foreground">Optional. Leave a score blank if you don't have it — we'll mark it as "no data", not as low performance.</p>
          </div>
          {subjects.map((s, si) => (
            <div key={s.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex gap-2">
                <Input aria-label="Subject name" placeholder="Subject, e.g. Microcontrollers" value={s.name} onChange={(e) => setSubjects((ss) => ss.map((x, i) => i === si ? { ...x, name: e.target.value } : x))} />
                <Button variant="ghost" size="icon" aria-label="Remove subject" onClick={() => setSubjects((ss) => ss.filter((_, i) => i !== si))}><Trash2 /></Button>
              </div>
              {s.topics.map((t, ti) => (
                <div key={t.id} className="flex gap-2 pl-3">
                  <Input aria-label="Topic name" placeholder="Topic" value={t.name} onChange={(e) => setTopic(si, ti, { name: e.target.value })} />
                  <Input aria-label="Score percent" type="number" className="w-28" placeholder="Score %" value={t.score ?? ""} onChange={(e) => setTopic(si, ti, { score: e.target.value === "" ? null : Number(e.target.value) })} />
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setSubjects((ss) => ss.map((x, i) => i === si ? { ...x, topics: [...x.topics, { id: uid(), name: "", score: null }] } : x))}><Plus /> Add topic</Button>
            </div>
          ))}
          {errors.scores && <p className="text-sm text-destructive">{errors.scores}</p>}
          <Button variant="outline" onClick={() => setSubjects((ss) => [...ss, { id: uid(), name: "", topics: [{ id: uid(), name: "", score: null }] }])}><Plus /> Add subject</Button>
        </>)}

        {step === 2 && (<>
          <h1 className="text-xl font-bold">Interests & strengths</h1>
          <div className="space-y-2"><Label>What do you enjoy?</Label>
            <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <Chip key={i} active={p.interests.includes(i)} onClick={() => toggle("interests", i)}>{i}</Chip>)}</div>
            {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
          </div>
          <div className="space-y-2"><Label>Your strengths (optional)</Label>
            <div className="flex flex-wrap gap-2">{STRENGTHS.map((i) => <Chip key={i} active={p.strengths.includes(i)} onClick={() => toggle("strengths", i)}>{i}</Chip>)}</div>
          </div>
        </>)}

        {step === 3 && (<>
          <h1 className="text-xl font-bold">Goals & time</h1>
          <div className="space-y-2">
            <Label htmlFor="career">Preferred career direction</Label>
            <select id="career" className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" value={p.career} onChange={(e) => set("career", e.target.value)}>
              <option value="">Not sure yet</option>
              {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <Label>Study time per day: <span className="text-primary">{p.studyHours} h</span></Label>
            <Slider min={0.5} max={6} step={0.5} value={[p.studyHours]} onValueChange={([v]) => set("studyHours", v ?? 2)} aria-label="Study hours per day" />
          </div>
          <Field label="Short-term learning goal" error={errors.goal}>
            <Textarea id="goal" placeholder="e.g. Score 70%+ in Signals by end of semester" value={p.goal} onChange={(e) => set("goal", e.target.value)} />
          </Field>
        </>)}

        <div className="flex justify-between border-t pt-5">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          {step < 3
            ? <Button onClick={() => validate() && setStep(step + 1)}>Continue</Button>
            : <Button onClick={finish}><Check /> Generate My EduPath</Button>}
        </div>
      </Panel>
    </div>
  );
}

type Errs = Partial<Record<"name" | "branch" | "year" | "cgpa" | "scores" | "interests" | "goal", string>>;

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  const id = (children as React.ReactElement<{ id?: string }>).props.id;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
