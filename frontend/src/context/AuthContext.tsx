import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  handleUserLogin,
  handleUserLogout,
  handleUserSignup,
} from "../handlers/authHandlers";
import type { AuthUser } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistSession(accessToken: string, user: AuthUser): void {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("authUser", JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authUser");
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token, user: loggedInUser } = await handleUserLogin(
        identifier,
        password
      );
      persistSession(access_token, loggedInUser);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token, user: newUser } = await handleUserSignup(
        username,
        email,
        password
      );
      persistSession(access_token, newUser);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await handleUserLogout();
    } finally {
      clearSession();
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
