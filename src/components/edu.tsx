import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Compass, LayoutDashboard, Target, CalendarCheck, Briefcase, MessageCircle, UserRound, Menu, X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { STATUS_LABEL, type TopicStatus } from "@/lib/edupath";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-display font-bold">
      <span className="grid size-8 place-items-center rounded-lg bg-brand text-primary-foreground">
        <Compass className="size-4" />
      </span>
      <span className={light ? "text-sidebar-accent-foreground" : "text-foreground"}>
        EduPath <span className="text-cyan">AI</span>
      </span>
    </Link>
  );
}

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/weak-topics", label: "Weak Topics", icon: Target },
  { to: "/roadmap", label: "Study Roadmap", icon: CalendarCheck },
  { to: "/careers", label: "Career Explorer", icon: Briefcase },
  { to: "/ask", label: "Ask EduPath", icon: MessageCircle },
  { to: "/profile", label: "Profile & Settings", icon: UserRound },
] as const;

function NavLinks({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNav}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            path === to
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon className={cn("size-4", path === to && "text-sidebar-primary")} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state } = useStore();
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 bg-sidebar p-5 lg:flex">
        <Logo light />
        <NavLinks />
        <div className="mt-auto rounded-lg border border-sidebar-border p-3 text-xs text-sidebar-foreground/70">
          <Sparkles className="mb-1 size-4 text-sidebar-primary" />
          Recommendations use transparent, rule-based demo logic. Data stays in this browser.
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[57px] z-30 bg-sidebar p-4 lg:hidden">
          <NavLinks onNav={() => setOpen(false)} />
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {state.profile?.name.includes("(demo)") && (
          <p className="mb-4 inline-flex rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            Demo data loaded — replace it any time from Profile & Settings
          </p>
        )}
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>{children}</section>;
}

const STATUS_STYLE: Record<TopicStatus, string> = {
  attention: "bg-destructive/10 text-destructive",
  review: "bg-warning/15 text-foreground",
  strong: "bg-success/15 text-success",
  nodata: "bg-muted text-muted-foreground",
};
export function StatusBadge({ status }: { status: TopicStatus }) {
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}

export function Empty({ icon: Icon, title, body, action }: { icon: typeof Target; title: string; body: string; action?: ReactNode }) {
  return (
    <Panel className="flex flex-col items-center py-12 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-secondary text-primary"><Icon /></span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Panel>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

export function NeedsProfile({ children }: { children: ReactNode }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  if (!state.profile)
    return (
      <Empty
        icon={Compass}
        title="Let's set up your EduPath first"
        body="Answer a few quick questions so we can build your learning path. Takes about two minutes."
        action={<Button asChild><Link to="/onboarding">Build My Learning Path</Link></Button>}
      />
    );
  return <>{children}</>;
}
