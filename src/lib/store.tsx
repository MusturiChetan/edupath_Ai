import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  EMPTY_STATE,
  uid,
  type State,
  DEMO_PROFILE,
  DEMO_SUBJECTS,
  generateTasks,
} from "./edupath";
import { useAuth } from "./auth";

type Ctx = {
  state: State;
  ready: boolean;
  update: (fn: (s: State) => State, activity?: string) => void;
  reset: () => void;
  loadDemoData: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<State>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  // User-isolated storage key
  const storageKey = user ? `edupath_student_${user.id}_v2` : "edupath_guest_v2";

  // Load user data whenever authenticated user changes
  useEffect(() => {
    setReady(false);
    if (!user) {
      setState(EMPTY_STATE);
      setReady(true);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...EMPTY_STATE, ...parsed });
      } else {
        // Initialize default empty profile with registered user details
        setState({
          ...EMPTY_STATE,
          profile: {
            name: user.fullName,
            course: user.course,
            branch: user.branch,
            year: user.year,
            cgpa: null,
            interests: [],
            strengths: [],
            career: "",
            studyHours: 2,
            goal: "",
          },
        });
      }
    } catch (e) {
      console.error("Failed to parse student data from storage:", e);
      setState(EMPTY_STATE);
    } finally {
      setReady(true);
    }
  }, [user, storageKey]);

  // Persist user data on updates
  useEffect(() => {
    if (ready && user) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, ready, user, storageKey]);

  const update: Ctx["update"] = (fn, activity) => {
    setState((s) => {
      const next = fn(s);
      return activity
        ? {
            ...next,
            activity: [{ id: uid(), text: activity, at: Date.now() }, ...next.activity].slice(
              0,
              30,
            ),
          }
        : next;
    });
  };

  const reset = () => {
    if (user) {
      localStorage.removeItem(storageKey);
      setState({
        ...EMPTY_STATE,
        profile: {
          name: user.fullName,
          course: user.course,
          branch: user.branch,
          year: user.year,
          cgpa: null,
          interests: [],
          strengths: [],
          career: "",
          studyHours: 2,
          goal: "",
        },
      });
    } else {
      setState(EMPTY_STATE);
    }
  };

  const loadDemoData = () => {
    if (!user) return;
    const demoProfile = {
      ...DEMO_PROFILE,
      name: `${user.fullName} (Demo Plan)`,
      course: user.course || DEMO_PROFILE.course,
      branch: user.branch || DEMO_PROFILE.branch,
      year: user.year || DEMO_PROFILE.year,
    };
    const demoTasks = generateTasks(demoProfile, DEMO_SUBJECTS);
    setState({
      profile: demoProfile,
      subjects: DEMO_SUBJECTS,
      tasks: demoTasks,
      activity: [
        { id: uid(), text: "Loaded demo curriculum & exam scores", at: Date.now() },
        { id: uid(), text: "Generated 7-day personalized study roadmap", at: Date.now() - 3600000 },
      ],
      chat: [],
    });
  };

  return (
    <StoreCtx.Provider value={{ state, ready, update, reset, loadDemoData }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
