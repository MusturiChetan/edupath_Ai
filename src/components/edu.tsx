import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Compass,
  LayoutDashboard,
  Target,
  CalendarCheck,
  Briefcase,
  MessageCircle,
  UserRound,
  Menu,
  X,
  Sparkles,
  LogOut,
  ShieldCheck,
  Cloud,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { STATUS_LABEL, type TopicStatus } from "@/lib/edupath";
import { ProtectedRoute } from "@/components/protected-route";

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
  const { state, loadDemoData } = useStore();
  const { user, logout, isCloudBackend } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success("Demo student performance data loaded!");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <ProtectedRoute>
      <div className="min-h-screen lg:pl-64">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between bg-sidebar p-5 lg:flex">
          <div className="flex flex-col gap-7">
            <Logo light />
            <NavLinks />
          </div>

          <div className="flex flex-col gap-3">
            {/* Quick Demo Data Loader for Hackathon Judges */}
            <button
              onClick={handleLoadDemo}
              className="flex items-center gap-2 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 px-3 py-2 text-left text-xs font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 transition-colors"
              title="Populates sample subjects, scores, and roadmap for demo evaluation"
            >
              <FileSpreadsheet className="size-3.5 text-cyan shrink-0" />
              <span>Load InnoHacks Demo Data</span>
            </button>

            {/* Storage & Backend Indicator */}
            <div className="rounded-lg border border-sidebar-border p-2.5 text-[11px] text-sidebar-foreground/70">
              <div className="flex items-center gap-1.5 font-medium text-sidebar-foreground/90">
                {isCloudBackend ? (
                  <>
                    <Cloud className="size-3 text-cyan" />
                    <span>Supabase Cloud DB</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-3 text-cyan" />
                    <span>Local WebCrypto Sandbox</span>
                  </>
                )}
              </div>
              <p className="mt-0.5 opacity-70">User-isolated encryption active</p>
            </div>

            {/* User Profile Card & Sign Out */}
            {user && (
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-primary-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-sidebar-accent-foreground">
                      {user.fullName}
                    </p>
                    <p className="truncate text-[10px] text-sidebar-foreground/60">{user.email}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-sidebar-border pt-2 text-xs">
                  <Link
                    to="/profile"
                    className="text-[11px] text-sidebar-foreground/75 hover:text-sidebar-accent-foreground"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-[11px] text-destructive hover:underline"
                  >
                    <LogOut className="size-3" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-muted-foreground"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </header>

        {open && (
          <div className="fixed inset-x-0 top-[57px] z-30 flex flex-col gap-4 bg-sidebar p-4 lg:hidden">
            <NavLinks onNav={() => setOpen(false)} />
            <button
              onClick={() => {
                handleLoadDemo();
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-sidebar-border p-2 text-xs text-sidebar-foreground/80"
            >
              <FileSpreadsheet className="size-4 text-cyan" /> Load InnoHacks Demo Data
            </button>
            {user && (
              <div className="border-t border-sidebar-border pt-3 flex items-center justify-between text-xs text-sidebar-foreground/80">
                <span className="truncate">{user.fullName}</span>
                <button onClick={handleLogout} className="text-destructive flex items-center gap-1">
                  <LogOut className="size-3" /> Log out
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {state.profile?.name.includes("(Demo Plan)") && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md bg-accent/30 border border-accent/40 px-3 py-1.5 text-xs text-accent-foreground">
              <span>
                Demo evaluation data loaded. You can edit scores or reset from Profile & Settings.
              </span>
              <Link to="/weak-topics" className="font-semibold underline">
                View Learning Gaps →
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl font-display">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>
      {children}
    </section>
  );
}

const STATUS_STYLE: Record<TopicStatus, string> = {
  attention: "bg-destructive/10 text-destructive border border-destructive/20",
  review: "bg-warning/15 text-foreground border border-warning/20",
  strong: "bg-success/15 text-success border border-success/20",
  nodata: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: TopicStatus }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof Target;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col items-center py-12 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-secondary text-primary">
        <Icon />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Panel>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground font-medium"
          : "bg-card hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

export function NeedsProfile({ children }: { children: ReactNode }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  if (!state.profile || (!state.profile.branch && !state.profile.interests.length))
    return (
      <Empty
        icon={Compass}
        title="Personalize your EduPath"
        body="Answer a few quick questions about your degree, topic scores, and career interests. Takes about two minutes."
        action={
          <Button asChild>
            <Link to="/onboarding">Build My Learning Path</Link>
          </Button>
        }
      />
    );
  return <>{children}</>;
}
