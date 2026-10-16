import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Target,
  CalendarCheck,
  Briefcase,
  MessageCircle,
  ShieldCheck,
  LineChart,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/edu";
import { meta } from "@/lib/meta";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "EduPath AI — From Learning Gaps to Career Goals",
      "Find the topics holding you back and connect a personal study plan to a career that fits you.",
    ),
  component: Landing,
});

const STEPS = [
  {
    icon: Target,
    title: "Understand your gaps",
    body: "Enter topic scores. See exactly which topics need attention (<50%), review (50-69%), or are strong (70%+) — with zero guessing.",
  },
  {
    icon: CalendarCheck,
    title: "Build your roadmap",
    body: "Get an interactive 7-day plan sized to your daily study time, scheduling weak topics first.",
  },
  {
    icon: Briefcase,
    title: "Move toward your career",
    body: "Every task links to a concrete skill for a technical career path matching your strengths.",
  },
];

const FEATURES = [
  {
    icon: LineChart,
    title: "Topic-level diagnosis",
    body: "Overall subject marks hide critical conceptual gaps. Topic scores uncover them before exam time.",
  },
  {
    icon: MessageCircle,
    title: "Ask EduPath Assistant",
    body: "Rule-based study and career guidance using your profile, weak topics, and active roadmap.",
  },
  {
    icon: ShieldCheck,
    title: "Account-based progress",
    body: "Local accounts use PBKDF2 password hashing. Learning data stays in this browser; Supabase can provide authentication.",
  },
];

function Landing() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
                Hi, {user.fullName.split(" ")[0]}
              </span>
              <Button asChild size="sm">
                <Link to="/dashboard">
                  <UserRound className="size-4 mr-1.5" /> Open Dashboard
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login" search={{}}>
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-secondary/80 px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>InnoHacks 2.0 • From Learning Gaps to Career Goals</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.08] sm:text-6xl text-foreground">
              Know what to learn next. <br />
              <span className="text-cyan">Know where it leads.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              EduPath AI analyzes your past test scores, diagnoses weak topics without fluff, builds
              a personalized 7-day study roadmap, and connects every step to career paths you care
              about.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/dashboard">
                      Go to My Dashboard <ArrowRight className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/weak-topics">Check Learning Gaps</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/register">
                      Build My Learning Path <ArrowRight className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login" search={{}}>
                      Sign In to Existing Account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Sample Insight Card */}
          <div className="rounded-2xl bg-brand p-6 text-primary-foreground shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-cyan font-bold">
                Diagnosed Learning Gap
              </p>
              <span className="rounded bg-destructive/30 border border-destructive/40 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Needs Attention (&lt;50%)
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold">Interrupts & Timers — 42%</p>
            <p className="text-sm opacity-80">Microcontrollers · BTech Sem 5</p>
            <div className="mt-4 h-2 rounded-full bg-primary-foreground/20">
              <div className="h-2 w-[42%] rounded-full bg-cyan" />
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan">
                Actionable 7-Day Plan
              </p>
              {[
                "Mon · Rebuild basics: Interrupt Service Routines · 70 min",
                "Tue · Timers & Prescalers practice problems · 50 min",
                "Wed · Hands-on Arduino/STM32 GPIO registers · 50 min",
              ].map((t) => (
                <div
                  key={t}
                  className="rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs backdrop-blur-sm"
                >
                  {t}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-medium text-cyan">
              → Bridges skill gaps for Embedded Systems Engineer & IoT Engineer
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="border-y bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              How EduPath Works
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              A transparent, rule-based approach that turns raw performance into structured career
              momentum.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-xl border bg-background p-6 shadow-sm">
                <span className="font-display text-sm font-bold text-cyan">0{i + 1}</span>
                <s.icon className="mt-3 size-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card">
            <div className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">EduPath AI</span>
            <span>· InnoHacks 2.0 Hackathon Demonstration</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Transparent Rule-Based Guidance</span>
            <span>•</span>
            <span>Zero Data Selling</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
