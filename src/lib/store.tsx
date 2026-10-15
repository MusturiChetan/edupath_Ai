import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { EMPTY_STATE, uid, type State } from "./edupath";

const KEY = "edupath-ai-v1";
type Ctx = {
  state: State;
  ready: boolean;
  update: (fn: (s: State) => State, activity?: string) => void;
  reset: () => void;
};
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY_STATE, ...JSON.parse(raw) });
    } catch { /* ignore corrupt data */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const update: Ctx["update"] = (fn, activity) =>
    setState((s) => {
      const n = fn(s);
      return activity
        ? { ...n, activity: [{ id: uid(), text: activity, at: Date.now() }, ...n.activity].slice(0, 20) }
        : n;
    });
  const reset = () => { localStorage.removeItem(KEY); setState(EMPTY_STATE); };
  return <StoreCtx.Provider value={{ state, ready, update, reset }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
