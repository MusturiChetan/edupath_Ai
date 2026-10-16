import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabaseConfig, isSupabaseConfigured } from "./supabase";

export type User = {
  id: string;
  email: string;
  fullName: string;
  course: string;
  branch: string;
  year: string;
  createdAt: string;
};

export type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  course: string;
  branch: string;
  year: string;
};

type Session = {
  token: string;
  userId: string;
  expiresAt: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isCloudBackend: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const SESSION_KEY = "edupath_auth_session";
const LOCAL_USERS_KEY = "edupath_secure_registry_v1";

// Web Crypto PBKDF2 Password Hashing (Zero Plaintext Security)
async function generateSalt(): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
  );

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const exported = await crypto.subtle.exportKey("raw", derivedKey);
  return Array.from(new Uint8Array(exported))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateCryptographicToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

type StoredLocalUser = User & {
  passwordHash: string;
  salt: string;
};

function getLocalUsers(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: StoredLocalUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCloud = isSupabaseConfigured();

  // Initialize and restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const rawSession = localStorage.getItem(SESSION_KEY);
        if (!rawSession) {
          setIsLoading(false);
          return;
        }

        const sess: Session = JSON.parse(rawSession);
        if (Date.now() > sess.expiresAt) {
          localStorage.removeItem(SESSION_KEY);
          setIsLoading(false);
          return;
        }

        if (isCloud) {
          // Verify with Supabase
          const config = getSupabaseConfig();
          if (config) {
            const res = await fetch(`${config.url}/auth/v1/user`, {
              headers: {
                apikey: config.anonKey,
                Authorization: `Bearer ${sess.token}`,
              },
            });

            if (res.ok) {
              const data = await res.json();
              const meta = data.user_metadata || {};
              setUser({
                id: data.id,
                email: data.email,
                fullName: meta.full_name || data.email.split("@")[0],
                course: meta.course || "BTech",
                branch: meta.branch || "",
                year: meta.year || "",
                createdAt: data.created_at,
              });
              setSession(sess);
              setIsLoading(false);
              return;
            }
          }
        }

        // Local Secure Mode Restoration
        const localUsers = getLocalUsers();
        const found = localUsers.find((u) => u.id === sess.userId);
        if (found) {
          const { passwordHash: _, salt: __, ...cleanUser } = found;
          setUser(cleanUser);
          setSession(sess);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        console.error("Error restoring auth session:", err);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [isCloud]);

  // Login handler
  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    if (isCloud) {
      const config = getSupabaseConfig();
      if (config) {
        try {
          const res = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
              apikey: config.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: cleanEmail, password }),
          });

          const data = await res.json();
          if (!res.ok) {
            return {
              success: false,
              error: data.error_description || data.msg || "Invalid email or password.",
            };
          }

          const supaUser = data.user;
          const meta = supaUser.user_metadata || {};
          const newUser: User = {
            id: supaUser.id,
            email: supaUser.email,
            fullName: meta.full_name || supaUser.email.split("@")[0],
            course: meta.course || "BTech",
            branch: meta.branch || "",
            year: meta.year || "",
            createdAt: supaUser.created_at,
          };

          const newSession: Session = {
            token: data.access_token,
            userId: supaUser.id,
            expiresAt: Date.now() + (data.expires_in ? data.expires_in * 1000 : duration),
          };

          localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
          setUser(newUser);
          setSession(newSession);
          return { success: true };
        } catch (err) {
          console.error("Supabase login error:", err);
          return { success: false, error: "Network error connecting to authentication server." };
        }
      }
    }

    // Local Secure Sandbox Hashing
    const users = getLocalUsers();
    const candidate = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!candidate) {
      return { success: false, error: "No account found with this email address." };
    }

    const testHash = await hashPassword(password, candidate.salt);
    if (!timingSafeEqual(testHash, candidate.passwordHash)) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const newSession: Session = {
      token: generateCryptographicToken(),
      userId: candidate.id,
      expiresAt: Date.now() + duration,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    const { passwordHash: _, salt: __, ...cleanUser } = candidate;
    setUser(cleanUser);
    setSession(newSession);
    return { success: true };
  };

  // Register handler
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    if (isCloud) {
      const config = getSupabaseConfig();
      if (config) {
        try {
          const res = await fetch(`${config.url}/auth/v1/signup`, {
            method: "POST",
            headers: {
              apikey: config.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: cleanEmail,
              password: data.password,
              data: {
                full_name: data.fullName.trim(),
                course: data.course,
                branch: data.branch.trim(),
                year: data.year.trim(),
              },
            }),
          });

          const resData = await res.json();
          if (!res.ok) {
            return {
              success: false,
              error: resData.error_description || resData.msg || "Registration failed.",
            };
          }

          if (resData.access_token && resData.user) {
            const newUser: User = {
              id: resData.user.id,
              email: resData.user.email,
              fullName: data.fullName.trim(),
              course: data.course,
              branch: data.branch.trim(),
              year: data.year.trim(),
              createdAt: resData.user.created_at,
            };
            const newSession: Session = {
              token: resData.access_token,
              userId: resData.user.id,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            setUser(newUser);
            setSession(newSession);
          }

          return { success: true };
        } catch (err) {
          console.error("Supabase registration error:", err);
          return { success: false, error: "Network error during registration." };
        }
      }
    }

    // Local Secure Sandbox Registration
    const users = getLocalUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email address already exists." };
    }

    const salt = await generateSalt();
    const passwordHash = await hashPassword(data.password, salt);
    const userId = "usr_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

    const newUser: StoredLocalUser = {
      id: userId,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      course: data.course,
      branch: data.branch.trim(),
      year: data.year.trim(),
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    };

    saveLocalUsers([...users, newUser]);

    const newSession: Session = {
      token: generateCryptographicToken(),
      userId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    const { passwordHash: _, salt: __, ...cleanUser } = newUser;
    setUser(cleanUser);
    setSession(newSession);
    return { success: true };
  };

  // Logout handler
  const logout = async () => {
    if (isCloud && session?.token) {
      const config = getSupabaseConfig();
      if (config) {
        try {
          await fetch(`${config.url}/auth/v1/logout`, {
            method: "POST",
            headers: {
              apikey: config.anonKey,
              Authorization: `Bearer ${session.token}`,
            },
          });
        } catch {
          // ignore network failure during logout
        }
      }
    }

    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setSession(null);
  };

  // Forgot password handler
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isCloud) {
      return {
        success: false,
        message:
          "Local demo accounts cannot reset passwords. Sign in from the browser where the account was created, or create a new account.",
      };
    }

    const config = getSupabaseConfig();
    if (!config) {
      return {
        success: false,
        message: "The password recovery service is not configured. Try again later.",
      };
    }

    try {
      const response = await fetch(`${config.url}/auth/v1/recover`, {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (!response.ok) {
        return {
          success: false,
          message: "The password recovery service could not accept the request. Try again later.",
        };
      }
    } catch {
      return {
        success: false,
        message: "Could not reach the password recovery service. Try again later.",
      };
    }

    // Keep the response generic so account existence is not disclosed.
    return {
      success: true,
      message: "If an account exists for this email, you will receive password reset instructions.",
    };
  };

  // Update profile handler
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };

    if (!isCloud) {
      const users = getLocalUsers();
      const nextUsers = users.map((u) => (u.id === user.id ? { ...u, ...updates } : u));
      saveLocalUsers(nextUsers);
    }

    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isCloudBackend: isCloud,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
