import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/edu";
import { useAuth } from "@/lib/auth";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/login")({
  head: () =>
    meta(
      "Sign In — EduPath AI",
      "Sign in to your EduPath AI account to access your learning gaps and study roadmap.",
    ),
  validateSearch: (search: Record<string, unknown>) =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  component: LoginPage,
});

function LoginPage() {
  const { login, isCloudBackend } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const redirectTarget = search["redirect"] || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to sign in. Please check your credentials.");
      return;
    }

    toast.success("Welcome back to EduPath AI!");
    navigate({ to: redirectTarget });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:grid lg:grid-cols-2">
      {/* Left Column: Premium Branding & Value Proposition */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-primary-foreground lg:flex">
        <div className="relative z-10">
          <Logo light />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
            <Sparkles className="size-3.5 text-cyan" />
            <span>From Learning Gaps to Career Goals</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Know exactly what to study. <br />
            <span className="text-cyan">Know where your degree leads.</span>
          </h1>
          <p className="text-base text-primary-foreground/80">
            Exam scores tell you how you performed, but not which topics are holding you back.
            EduPath turns your past marks into a clear 7-day study roadmap connected to real
            careers.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Transparent topic-level gap analysis (No guessing)",
              "Personalized 7-day study plan sized to your daily hours",
              "Rule-based career alignment based on your actual strengths",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <CheckCircle2 className="size-4 shrink-0 text-cyan" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur-md border border-primary-foreground/15">
            <p className="text-xs uppercase tracking-wider text-cyan font-bold">
              Hackathon Prototype
            </p>
            <p className="mt-1 text-sm font-medium">InnoHacks 2.0 Demonstration Edition</p>
            <p className="mt-0.5 text-xs text-primary-foreground/70">
              {isCloudBackend
                ? "Supabase authentication; learning data stays in this browser"
                : "Local demo account; learning data stays in this browser"}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-primary-foreground/70 border-t border-primary-foreground/15 pt-6">
          <span>© 2026 EduPath AI</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-cyan" /> Progress is separated by account
          </span>
        </div>
      </div>

      {/* Right Column: Clean, Modern Authentication Card */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create a student account
              </Link>
            </p>
          </div>

          {error && (
            <div
              className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
              role="alert"
            >
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@college.edu"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {isCloudBackend ? (
              <p className="py-1 text-xs text-muted-foreground">
                Session duration is managed by your account provider.
              </p>
            ) : (
              <div className="flex items-center space-x-2 py-1">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-xs font-normal text-muted-foreground cursor-pointer"
                >
                  Remember this device for 30 days
                </Label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Compass className="size-4 animate-spin mr-2" /> Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            <span>By signing in, you agree to EduPath AI's </span>
            <span className="text-foreground">Student Honor Code</span>
            <span> & </span>
            <span className="text-foreground">Privacy Guidelines</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
