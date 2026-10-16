import { webcrypto } from "node:crypto";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth, type RegisterData } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";

const studentA: RegisterData = {
  fullName: "QA Student A",
  email: "student-a@example.test",
  password: "TestPass123",
  course: "BTech",
  branch: "Electronics",
  year: "Year 3",
};

const studentB: RegisterData = {
  ...studentA,
  fullName: "QA Student B",
  email: "student-b@example.test",
};

function Harness() {
  const { user, register, login, logout, resetPassword } = useAuth();
  const { state, ready, update } = useStore();
  const [resetMessage, setResetMessage] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const registerStudent = async (student: RegisterData) => {
    const result = await register(student);
    setAuthMessage(result.success ? "success" : (result.error ?? "failed"));
  };

  const signIn = async (password: string, rememberMe = false) => {
    const result = await login(studentA.email, password, rememberMe);
    setAuthMessage(result.success ? "success" : (result.error ?? "failed"));
  };

  return (
    <div>
      <p data-testid="user">{user?.email ?? "signed out"}</p>
      <p data-testid="ready">{String(ready)}</p>
      <p data-testid="profile">{state.profile?.name ?? "no profile"}</p>
      <p data-testid="subjects">{state.subjects.map((subject) => subject.name).join(",")}</p>
      <p data-testid="auth-result">{authMessage}</p>
      <p data-testid="reset-result">{resetMessage}</p>
      <button onClick={() => void registerStudent(studentA)}>Register A</button>
      <button onClick={() => void registerStudent(studentB)}>Register B</button>
      <button onClick={() => void registerStudent(studentA)}>Register A again</button>
      <button onClick={() => void signIn("WrongPass123")}>Sign in with wrong password</button>
      <button onClick={() => void signIn(studentA.password, true)}>Sign in for 30 days</button>
      <button onClick={() => void logout()}>Sign out</button>
      <button
        onClick={() =>
          update((current) => ({
            ...current,
            profile: { ...current.profile!, name: "A private profile" },
            subjects: [{ id: "private", name: "A private subject", topics: [] }],
          }))
        }
      >
        Add A data
      </button>
      <button
        onClick={() =>
          void resetPassword("student-a@example.test").then((result) =>
            setResetMessage(result.message),
          )
        }
      >
        Reset password
      </button>
    </div>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <StoreProvider>
        <Harness />
      </StoreProvider>
    </AuthProvider>,
  );
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe("local account and learning data flow", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: webcrypto });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("keeps learning data separated when another account registers in the same browser", async () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "Register A" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent(studentA.email));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent(studentA.fullName));

    fireEvent.click(screen.getByRole("button", { name: "Add A data" }));
    const usersAfterA = JSON.parse(localStorage.getItem("edupath_secure_registry_v1")!) as {
      id: string;
      email: string;
      passwordHash: string;
    }[];
    const userA = usersAfterA.find((user) => user.email === studentA.email);
    if (!userA) throw new Error("Test account A was not stored");
    expect(userA.passwordHash).not.toBe(studentA.password);
    expect(localStorage.getItem("edupath_secure_registry_v1")).not.toContain(studentA.password);
    await waitFor(() =>
      expect(localStorage.getItem(`edupath_student_${userA.id}_v2`)).toContain("A private subject"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Register B" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent(studentB.email));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent(studentB.fullName));
    expect(screen.getByTestId("subjects")).not.toHaveTextContent("A private subject");

    const users = JSON.parse(localStorage.getItem("edupath_secure_registry_v1")!) as {
      id: string;
      email: string;
    }[];
    const userB = users.find((user: { email: string }) => user.email === studentB.email);
    if (!userB) throw new Error("Test account B was not stored");
    const userBData = localStorage.getItem(`edupath_student_${userB.id}_v2`);
    expect(userBData).not.toContain("A private profile");
    expect(userBData).not.toContain("A private subject");
    expect(localStorage.getItem("edupath_auth_session")).toContain(userB.id);
  });

  it("rejects duplicate registrations and wrong passwords, then remembers a valid session", async () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "Register A" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent(studentA.email));

    fireEvent.click(screen.getByRole("button", { name: "Register A again" }));
    await waitFor(() =>
      expect(screen.getByTestId("auth-result")).toHaveTextContent("already exists"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("signed out"));

    fireEvent.click(screen.getByRole("button", { name: "Sign in with wrong password" }));
    await waitFor(() =>
      expect(screen.getByTestId("auth-result")).toHaveTextContent("Incorrect password"),
    );
    expect(screen.getByTestId("user")).toHaveTextContent("signed out");

    fireEvent.click(screen.getByRole("button", { name: "Sign in for 30 days" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent(studentA.email));
    const session = JSON.parse(localStorage.getItem("edupath_auth_session")!) as {
      expiresAt: number;
    };
    expect(session.expiresAt - Date.now()).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
  });

  it("explains that local demo accounts cannot use email password recovery", async () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
    await waitFor(() =>
      expect(screen.getByTestId("reset-result")).toHaveTextContent(
        "Local demo accounts cannot reset passwords",
      ),
    );
    expect(localStorage.getItem("edupath_secure_registry_v1")).toBeNull();
  });
});
