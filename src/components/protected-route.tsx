import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Compass } from "lucide-react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({
        to: "/login",
        search: { redirect: currentPath },
      });
    }
  }, [user, isLoading, navigate, currentPath]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-brand text-primary-foreground shadow-card animate-pulse">
            <Compass className="size-6 animate-spin text-cyan" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Authenticating session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
