import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, CalendarCheck, Briefcase, MessageCircle, ShieldCheck, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/edu";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("EduPath AI — From Learning Gaps to Career Goals", "Find the topics holding you back and connect a personal study plan to a career that fits you."),
  component: Landing,
});

const STEPS = [
  { icon: Target, title: "Understand your gaps", body: "Enter topic scores. See exactly which topics need attention — and why." },
  { icon: CalendarCheck, title: "Build your roadmap", body: "Get a 7-day plan sized to your daily study time, with weak topics first." },
  { icon: Briefcase, title: "Move toward your career", body: "Every task links to a skill for a career path that matches your interests." },
];
const FEATURES = [
  { icon: LineChart, title: "Topic-level analysis", body: "Marks hide gaps. Topic scores reveal them." },
  { icon: MessageCircle, title: "Ask EduPath", body: "A guidance assistant that answers from your own data." },
  { icon: ShieldCheck, title: "Honest & private", body: "Transparent rules, no hidden AI claims. Stored only in your browser." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Button asChild variant="ghost"><Link to="/dashboard">Open app</Link></Button>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">For college students</p>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-6xl">
              Know what to learn next. <span className="text-cyan">Know where it leads.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              EduPath turns your past scores into a clear list of weak topics, a weekly study plan, and career paths that match what you actually enjoy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/onboarding">Build My Learning Path <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#how">Explore How It Works</a></Button>
            </div>
          </div>
          <div className="rounded-2xl bg-brand p-6 text-primary-foreground shadow-card">
            <p className="text-xs uppercase tracking-wider opacity-70">Sample insight</p>
            <p className="mt-2 font-display text-xl font-semibold">Interrupts — 42%</p>
            <p className="text-sm opacity-80">Microcontrollers · Needs attention</p>
            <div className="mt-4 h-2 rounded-full bg-primary-foreground/20"><div className="h-2 w-[42%] rounded-full bg-cyan" /></div>
            <div className="mt-6 space-y-2 text-sm">
              {["Mon · Rebuild basics: Interrupts · 70 min", "Tue · GPIO & timers · 50 min", "Wed · Serial protocols · 50 min"].map((t) => (
                <div key={t} className="rounded-lg bg-primary-foreground/10 px-3 py-2">{t}</div>
              ))}
            </div>
            <p className="mt-4 text-xs opacity-70">→ Builds toward Embedded Systems Engineer</p>
          </div>
        </div>
      </section>

      <section id="how" className="border-y bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border p-6">
                <span className="font-display text-sm font-bold text-cyan">0{i + 1}</span>
                <s.icon className="mt-3 size-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <f.icon className="size-5 text-primary" />
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>© 2026 EduPath AI · Hackathon prototype</span>
          <span>Rule-based demo. Advanced AI analysis is a planned future integration.</span>
        </div>
      </footer>
    </div>
  );
}
