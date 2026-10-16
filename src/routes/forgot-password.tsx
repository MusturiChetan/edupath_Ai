import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/edu";
import { useAuth } from "@/lib/auth";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/forgot-password")({
  head: () =>
    meta(
      "Reset Password — EduPath AI",
      "Secure password recovery for your EduPath AI student account.",
    ),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword, isCloudBackend } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [requestSucceeded, setRequestSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    setResultMessage(result.message);
    setRequestSucceeded(result.success);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-card">
        <div className="text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Password Recovery
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isCloudBackend
              ? "Enter your registered email address to request recovery instructions."
              : "Password recovery is available only when an account provider is configured."}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-success/30 bg-success/10 p-5 text-center">
              {requestSucceeded && <CheckCircle2 className="mx-auto size-8 text-success mb-2" />}
              <p className="text-sm font-semibold text-foreground">
                {requestSucceeded ? "Recovery Request Sent" : "Password Reset Unavailable"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{resultMessage}</p>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link to="/login" search={{}}>
                <ArrowLeft className="size-4 mr-2" /> Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Registered Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="name@college.edu"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying…" : "Send Reset Instructions"}
            </Button>

            <div className="flex items-center justify-center pt-2">
              <Link
                to="/login"
                search={{}}
                className="inline-flex items-center text-xs font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-3.5 mr-1" /> Return to login
              </Link>
            </div>
          </form>
        )}

        <div className="border-t pt-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" /> Plaintext passwords are never emailed
            or stored.
          </p>
        </div>
      </div>
    </div>
  );
}
