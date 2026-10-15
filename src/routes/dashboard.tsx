import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Target, CalendarCheck, Briefcase, Clock, Flag, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppShell, NeedsProfile, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { DAYS, matchCareers, weakTopics } from "@/lib/edupath";

export const Route = createFileRoute("/dashboard")({
  head: () => meta("Dashboard — EduPath AI", "Your learning progress, next action and career matches at a glance."),
  component: () => <AppShell><NeedsProfile><Dashboard /></NeedsProfile></AppShell>,
});

function Dashboard() {
  const { state } = useStore();
  const p = state.profile!;
  const done = state.tasks.filter((t) => t.done);
  const planned = state.tasks.reduce((a, t) => a + t.minutes, 0);
  const completed = done.reduce((a, t) => a + t.minutes, 0);
  const pct = state.tasks.length ? Math.round((done.length / state.tasks.length) * 100) : 0;
  const next = state.tasks.find((t) => !t.done);
  const weak = weakTopics(state.subjects);
  const matches = matchCareers(p, state.subjects).slice(0, 3);

  return (
    <>
      <PageHeader title={`Welcome back, ${p.name.split(" ")[0]}`} sub={`${p.course} · ${p.branch} · ${p.year}`} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="bg-brand text-primary-foreground lg:col-span-2">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-75"><Flag className="size-3.5" /> Current goal</p>
          <p className="mt-2 font-display text-xl font-semibold">{p.goal}</p>
          <div className="mt-6 rounded-lg bg-primary-foreground/10 p-4">
            <p className="text-xs uppercase tracking-wider opacity-75">Recommended next action</p>
            {next ? (<>
              <p className="mt-1 font-semibold">{DAYS[next.day]} · {next.title}</p>
              <p className="text-sm opacity-80">{next.minutes} min · {next.skill}</p>
            </>) : <p className="mt-1">All tasks complete — regenerate your roadmap for next week.</p>}
            <Button asChild size="sm" variant="secondary" className="mt-3"><Link to="/roadmap">Open roadmap <ArrowRight /></Link></Button>
          </div>
        </Panel>
        <Panel>
          <h2 className="font-semibold">Weekly progress</h2>
          <p className="mt-3 font-display text-4xl font-bold">{pct}%</p>
          <Progress value={pct} className="mt-2" />
          <p className="mt-2 text-sm text-muted-foreground">{done.length} of {state.tasks.length} tasks done</p>
          <div className="mt-5 flex items-center gap-2 text-sm"><Clock className="size-4 text-primary" />
            <span><b>{Math.round(completed / 60 * 10) / 10}h</b> completed of <b>{Math.round(planned / 60 * 10) / 10}h</b> planned</span></div>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Career matches</h2>
            <Link to="/careers" className="text-sm font-medium text-primary hover:underline">Explore all</Link></div>
          <div className="grid gap-3 sm:grid-cols-3">
            {matches.map((m) => (
              <div key={m.career.id} className="rounded-lg border p-4">
                <p className="font-semibold">{m.career.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.points} match points (rule-based)</p>
                <p className="mt-2 line-clamp-2 text-sm">{m.reasons[0] ?? "Add interests to see why"}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-3 font-semibold">Upcoming tasks</h2>
          {state.tasks.filter((t) => !t.done).slice(0, 4).map((t) => (
            <div key={t.id} className="border-b py-2 text-sm last:border-0">
              <p className="font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{DAYS[t.day]} · {t.minutes} min · {t.priority}</p>
            </div>
          ))}
          {!state.tasks.some((t) => !t.done) && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Quick links</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { to: "/weak-topics", icon: Target, t: "Weak Topics", s: `${weak.length} topic${weak.length === 1 ? "" : "s"} below 70%` },
              { to: "/roadmap", icon: CalendarCheck, t: "Study Roadmap", s: `${state.tasks.length} tasks this week` },
              { to: "/careers", icon: Briefcase, t: "Career Explorer", s: "7 paths to compare" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="group rounded-lg border p-4 transition-colors hover:border-primary/50">
                <l.icon className="size-5 text-primary" /><p className="mt-2 font-semibold">{l.t}</p>
                <p className="text-sm text-muted-foreground">{l.s}</p>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><History className="size-4" /> Recent activity</h2>
          {state.activity.slice(0, 5).map((a) => (
            <p key={a.id} className="py-1.5 text-sm"><span className="text-muted-foreground">{new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> · {a.text}</p>
          ))}
          {!state.activity.length && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        </Panel>
      </div>
    </>
  );
}
