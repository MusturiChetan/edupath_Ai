import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/edu";
import { useAuth } from "@/lib/auth";
import { meta } from "@/lib/meta";

type RegisterErrorField =
  "fullName" | "email" | "password" | "confirmPassword" | "branch" | "year" | "form";
type RegisterErrors = Partial<Record<RegisterErrorField, string>>;

export const Route = createFileRoute("/register")({
  head: () =>
    meta(
      "Create Student Account — EduPath AI",
      "Register for EduPath AI to find weak topics and get your tailored study roadmap.",
    ),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [course, setCourse] = useState("BTech");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const validate = () => {
    const errs: RegisterErrors = {};

    if (!fullName.trim()) errs.fullName = "Full name is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters long.";
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errs.password = "Password must include both letters and numbers.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!branch.trim()) errs.branch = "Branch / Specialization is required.";
    if (!year.trim()) errs.year = "Current year or semester is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const res = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      course,
      branch: branch.trim(),
      year: year.trim(),
    });
    setLoading(false);

    if (!res.success) {
      setErrors({ form: res.error || "Failed to create account. Please try again." });
      return;
    }

    toast.success("Account created successfully! Let's personalize your path.");
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:grid lg:grid-cols-2">
      {/* Left Column: Branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-primary-foreground lg:flex">
        <div className="relative z-10">
          <Logo light />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
            <span>InnoHacks 2.0 Demonstration Edition</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Empower your academic journey with actionable insights.
          </h1>
          <p className="text-base text-primary-foreground/80">
            Create your account to unlock topic-level weakness diagnosis, a custom 7-day study plan,
            and career pathways calibrated to your degree and interests.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Student learning data saved in this browser",
              "Connect academic performance to real career skills",
              "Save and track progress by student account",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <CheckCircle2 className="size-4 shrink-0 text-cyan" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-primary-foreground/10 p-5 backdrop-blur-md border border-primary-foreground/15">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan">Why EduPath?</p>
            <p className="mt-1 text-sm italic text-primary-foreground/90">
              "Most students get a mark sheet. EduPath provides a roadmap — identifying exactly
              which concepts need attention before exams."
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-primary-foreground/70 border-t border-primary-foreground/15 pt-6">
          <span>© 2026 EduPath AI</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-cyan" /> Local password hashing uses PBKDF2
          </span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-12 xl:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create student account
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" search={{}} className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {errors.form && (
            <div
              className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <p className="font-medium">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  required
                  placeholder="e.g. Aarav Sharma"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="aarav@university.edu"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="course">Course / Degree</Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTech">BTech / BE</SelectItem>
                    <SelectItem value="BSc">BSc / BS</SelectItem>
                    <SelectItem value="BCA">BCA / MCA</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Degree">General Degree</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="year">Year / Semester</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="year"
                    required
                    placeholder="e.g. 3rd Yr · Sem 5"
                    className="pl-9"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="branch">Branch / Specialization</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="branch"
                  required
                  placeholder="e.g. Electronics & Communication"
                  className="pl-9"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
              {errors.branch && <p className="text-xs text-destructive">{errors.branch}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 8 chars"
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating Account…" : "Create Account & Start Onboarding"}
              {!loading && <ArrowRight className="size-4 ml-1.5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
