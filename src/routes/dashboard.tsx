import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Target,
  CalendarCheck,
  Briefcase,
  Clock,
  Flag,
  History,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell, NeedsProfile, PageHeader, Panel, StatusBadge } from "@/components/edu";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { DAYS, matchCareers, topicStatus, weakTopics, type Task } from "@/lib/edupath";

export const Route = createFileRoute("/dashboard")({
  head: () =>
    meta(
      "Dashboard — EduPath AI",
      "Your learning progress, next action and career matches at a glance.",
    ),
  component: () => (
    <AppShell>
      <NeedsProfile>
        <Dashboard />
      </NeedsProfile>
    </AppShell>
  ),
});

function Dashboard() {
  const { state, update } = useStore();
  const p = state.profile!;
  const done = state.tasks.filter((t) => t.done);
  const planned = state.tasks.reduce((a, t) => a + t.minutes, 0);
  const completed = done.reduce((a, t) => a + t.minutes, 0);
  const pct = state.tasks.length ? Math.round((done.length / state.tasks.length) * 100) : 0;
  const next = state.tasks.find((t) => !t.done);
  const weak = weakTopics(state.subjects);
  const matches = matchCareers(p, state.subjects).slice(0, 3);

  // Profile completion calculation
  const profileChecks = [
    { label: "Academic Details", done: !!p.branch && !!p.year },
    { label: "CGPA Recorded", done: p.cgpa !== null },
    {
      label: "Exam Scores Added",
      done: state.subjects.some((s) => s.topics.some((t) => t.score !== null)),
    },
    { label: "Interests Selected", done: p.interests.length > 0 },
    { label: "Target Career Set", done: !!p.career },
  ];
  const profilePct = Math.round(
    (profileChecks.filter((c) => c.done).length / profileChecks.length) * 100,
  );

  const toggleTask = (t: Task) => {
    update(
      (s) => ({
        ...s,
        tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
      }),
      `${t.done ? "Reopened" : "Completed"} “${t.title}”`,
    );
    if (!t.done) {
      toast.success("Task completed! Progress updated.");
    }
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${p.name.split(" ")[0]}`}
        sub={`${p.course} · ${p.branch || "General"} · ${p.year || "Student"}`}
        action={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/roadmap">
                <CalendarCheck className="size-4 mr-1.5" /> View Roadmap
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/weak-topics">
                <Target className="size-4 mr-1.5" /> Analyze Gaps
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Focus Card */}
        <Panel className="bg-brand text-primary-foreground lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-75">
              <Flag className="size-3.5" /> Current Academic Goal
            </p>
            <span className="rounded bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-semibold text-cyan">
              Targeted Plan
            </span>
          </div>
          <p className="mt-2 font-display text-xl font-semibold">
            {p.goal || "Build strong fundamentals across core subjects."}
          </p>

          <div className="mt-6 rounded-lg bg-primary-foreground/10 p-4 border border-primary-foreground/15 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider opacity-75">Recommended Next Action</p>
            {next ? (
              <>
                <p className="mt-1 font-semibold text-base">
                  {DAYS[next.day]} · {next.title}
                </p>
                <p className="text-sm opacity-85 mt-0.5">
                  {next.minutes} min · {next.skill}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm">
                All tasks complete! You can regenerate a fresh roadmap on the Study Roadmap page.
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link to="/roadmap">
                  Open roadmap <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
              {next && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => toggleTask(next)}
                >
                  <CheckCircle2 className="size-3.5 mr-1 text-cyan" /> Mark Done
                </Button>
              )}
            </div>
          </div>
        </Panel>

        {/* Weekly Study Progress */}
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Weekly Progress</h2>
            <span className="text-xs text-muted-foreground">
              {DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}
            </span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold text-foreground">{pct}%</p>
          <Progress value={pct} className="mt-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            {done.length} of {state.tasks.length} study tasks completed
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm border-t pt-4">
            <Clock className="size-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">
              <b className="text-foreground">{Math.round((completed / 60) * 10) / 10}h</b> completed
              of <b className="text-foreground">{Math.round((planned / 60) * 10) / 10}h</b> planned
            </span>
          </div>
        </Panel>

        {/* Profile Completion Indicator */}
        <Panel className="lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground">Profile Readiness</h2>
            <span className="font-display text-sm font-bold text-primary">{profilePct}%</span>
          </div>
          <Progress value={profilePct} className="mb-4" />
          <div className="space-y-2">
            {profileChecks.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className={c.done ? "text-foreground" : "text-muted-foreground"}>
                  {c.label}
                </span>
                {c.done ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Pending</span>
                )}
              </div>
            ))}
          </div>
          {profilePct < 100 && (
            <Button asChild size="sm" variant="ghost" className="w-full mt-4 text-xs text-primary">
              <Link to="/onboarding">Complete Setup →</Link>
            </Button>
          )}
        </Panel>

        {/* Urgent Learning Gaps */}
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Topics Needing Attention</h2>
            </div>
            <Link to="/weak-topics" className="text-xs font-medium text-primary hover:underline">
              View all {weak.length} gaps →
            </Link>
          </div>

          {weak.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {weak.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="rounded-lg border p-3 bg-card hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-foreground">{w.name}</p>
                    <StatusBadge status={topicStatus(w.score)} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {w.subject} · Score: <b>{w.score}%</b>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {topicStatus(w.score) === "attention"
                      ? "Under 50% threshold. Rebuild fundamental definitions and worked problems."
                      : "Scored 50–69%. Revisit with targeted 15-minute practice drills."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {state.subjects.length === 0 ? (
                <p>
                  No topic scores recorded yet. Add scores on the Weak Topics page to uncover
                  learning gaps.
                </p>
              ) : (
                <p className="text-success font-medium">
                  No topics below 70%! All recorded topics are in good standing.
                </p>
              )}
            </div>
          )}
        </Panel>

        {/* Career Matches */}
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary" />
              <h2 className="font-semibold text-foreground">Career Recommendations</h2>
            </div>
            <Link to="/careers" className="text-xs font-medium text-primary hover:underline">
              Explore 9 career paths →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {matches.map((m) => (
              <div key={m.career.id} className="rounded-lg border p-3.5 bg-card">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm text-foreground">{m.career.title}</p>
                  <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-secondary-foreground">
                    {m.points} pts
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {m.career.overview}
                </p>
                <div className="mt-3 border-t pt-2 text-[11px] text-primary font-medium">
                  {m.reasons[0] || "Aligned with your coursework"}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Upcoming Tasks with Quick Toggle */}
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Upcoming Study Tasks</h2>
            <Link to="/roadmap" className="text-xs text-primary hover:underline">
              Full plan
            </Link>
          </div>
          <div className="space-y-2">
            {state.tasks
              .filter((t) => !t.done)
              .slice(0, 4)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2.5 rounded-lg border p-2 text-sm bg-card"
                >
                  <Checkbox
                    checked={t.done}
                    onCheckedChange={() => toggleTask(t)}
                    aria-label={`Complete ${t.title}`}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs text-foreground leading-tight">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {DAYS[t.day]} · {t.minutes} min · {t.priority}
                    </p>
                  </div>
                </div>
              ))}
            {!state.tasks.some((t) => !t.done) && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nothing pending this week.
              </p>
            )}
          </div>
        </Panel>

        {/* Quick Links */}
        <Panel className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                to: "/weak-topics",
                icon: Target,
                t: "Learning-Gap Analysis",
                s: `${weak.length} topic${weak.length === 1 ? "" : "s"} flagged`,
              },
              {
                to: "/roadmap",
                icon: CalendarCheck,
                t: "7-Day Study Roadmap",
                s: `${state.tasks.length} total tasks scheduled`,
              },
              {
                to: "/ask",
                icon: Sparkles,
                t: "Ask EduPath AI",
                s: "Personalized guidance assistant",
              },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group rounded-lg border p-4 transition-colors hover:border-primary/50 bg-card hover:bg-secondary/20"
              >
                <l.icon className="size-5 text-primary" />
                <p className="mt-2 font-semibold text-sm text-foreground">{l.t}</p>
                <p className="text-xs text-muted-foreground">{l.s}</p>
              </Link>
            ))}
          </div>
        </Panel>

        {/* Recent Activity Log */}
        <Panel>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <History className="size-4 text-primary" /> Learning Log
          </h2>
          <div className="space-y-1.5">
            {state.activity.slice(0, 5).map((a) => (
              <div key={a.id} className="py-1 text-xs border-b last:border-0">
                <span className="text-muted-foreground font-mono">
                  {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-foreground ml-1.5">{a.text}</span>
              </div>
            ))}
            {!state.activity.length && (
              <p className="text-xs text-muted-foreground py-2">No activity logged yet.</p>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
