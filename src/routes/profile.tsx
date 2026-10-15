import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  RotateCcw,
  Pencil,
  LogOut,
  Cloud,
  User as UserIcon,
  Calendar,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppShell, Chip, NeedsProfile, PageHeader, Panel } from "@/components/edu";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { meta } from "@/lib/meta";
import { CAREERS, INTERESTS, type Profile } from "@/lib/edupath";

export const Route = createFileRoute("/profile")({
  head: () =>
    meta(
      "Profile & Settings — EduPath AI",
      "Edit your interests, goals and study time, or manage your student account.",
    ),
  component: () => (
    <AppShell>
      <NeedsProfile>
        <ProfilePage />
      </NeedsProfile>
    </AppShell>
  ),
});

function ProfilePage() {
  const { state, update, reset, loadDemoData } = useStore();
  const { user, logout, isCloudBackend, updateProfile } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState<Profile>(state.profile!);

  useEffect(() => {
    if (state.profile) setP(state.profile);
  }, [state.profile]);

  const save = async () => {
    if (!p.interests.length) {
      toast.error("Pick at least one interest to help career matching.");
      return;
    }
    if (!p.goal.trim()) {
      toast.error("Goal cannot be empty.");
      return;
    }
    update((s) => ({ ...s, profile: p }), "Updated profile & study preferences");
    if (user) {
      await updateProfile({
        fullName: p.name,
        course: p.course,
        branch: p.branch,
        year: p.year,
      });
    }
    toast.success("Profile changes saved!");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
    nav({ to: "/login" });
  };

  return (
    <>
      <PageHeader
        title="Student Profile & Settings"
        sub="Manage your personal preferences, academic goals, and data storage."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/onboarding">
                <Pencil className="size-4 mr-1.5" /> Retake Onboarding
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-destructive">
              <LogOut className="size-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        {/* Left: User Account Summary */}
        <Panel className="flex flex-col justify-between">
          <div>
            <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-brand font-display text-2xl font-bold text-primary-foreground shadow-card">
              {p.name[0]?.toUpperCase() || "S"}
            </div>
            <h2 className="text-xl font-bold text-foreground">{p.name}</h2>
            <p className="text-xs text-muted-foreground">
              {user?.email || "Authenticated Student"}
            </p>

            <dl className="mt-5 space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between py-1 border-b border-border/50">
                <dt className="text-muted-foreground">Degree / Course</dt>
                <dd className="font-medium text-foreground">{p.course}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <dt className="text-muted-foreground">Branch</dt>
                <dd className="font-medium text-foreground">{p.branch || "General"}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <dt className="text-muted-foreground">Year / Semester</dt>
                <dd className="font-medium text-foreground">{p.year || "Not specified"}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <dt className="text-muted-foreground">Recorded CGPA</dt>
                <dd className="font-medium text-foreground">
                  {p.cgpa !== null ? p.cgpa : "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <dt className="text-muted-foreground">Target Career</dt>
                <dd className="font-medium text-primary">
                  {CAREERS.find((c) => c.id === p.career)?.title || "Undecided"}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-muted-foreground">Registered Since</dt>
                <dd className="font-mono text-xs text-muted-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Active Session"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 rounded-lg border bg-secondary/50 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
              {isCloudBackend ? (
                <>
                  <Cloud className="size-3.5 text-cyan" />
                  <span>Cloud Storage Mode (Supabase)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>Client-Side Cryptographic Sandbox</span>
                </>
              )}
            </div>
            Data is strictly isolated per student ID (
            <b>{user?.id ? user.id.slice(0, 12) + "…" : "Local"}</b>).
          </div>
        </Panel>

        {/* Right: Preferences Form */}
        <Panel className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Study & Career Preferences</h2>

          <div className="space-y-2">
            <Label>Interests & Curiosity Areas</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Chip
                  key={i}
                  active={p.interests.includes(i)}
                  onClick={() =>
                    setP({
                      ...p,
                      interests: p.interests.includes(i)
                        ? p.interests.filter((x) => x !== i)
                        : [...p.interests, i],
                    })
                  }
                >
                  {i}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pgoal">Current Learning Goal</Label>
            <Textarea
              id="pgoal"
              value={p.goal}
              onChange={(e) => setP({ ...p, goal: e.target.value })}
              placeholder="e.g. Master microcontrollers and score 75%+ in semester exams"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Daily Available Study Time</Label>
              <span className="font-semibold text-primary">{p.studyHours} hours/day</span>
            </div>
            <Slider
              min={0.5}
              max={6}
              step={0.5}
              value={[p.studyHours]}
              onValueChange={([v]) => setP({ ...p, studyHours: v ?? 2 })}
              aria-label="Study hours per day"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={save}>Save Preferences</Button>
            <Button
              variant="outline"
              onClick={() => {
                loadDemoData();
                toast.success("Loaded demo curriculum & scores!");
              }}
            >
              <FileSpreadsheet className="size-4 mr-1.5 text-cyan" /> Load InnoHacks Demo Data
            </Button>
          </div>
        </Panel>

        {/* Security & Data Reset */}
        <Panel className="border-destructive/30 lg:col-span-2">
          <h2 className="font-semibold text-foreground">Reset Demo Data</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Clear your subjects, entered scores, generated tasks, and chat history while keeping
            your student login account.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <RotateCcw className="size-4 mr-1.5" /> Clear My Academic Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all study data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all topic scores, roadmap tasks, and chat logs for your account.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    reset();
                    toast.success("Academic data reset.");
                  }}
                >
                  Yes, reset data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Panel>
      </div>
    </>
  );
}
