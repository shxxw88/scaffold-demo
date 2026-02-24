import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// 허용된 이메일과 비밀번호 설정 (여기서 변경 가능)
const ALLOWED_CREDENTIALS = {
  email: "example@example.com", // 원하는 이메일로 변경하세요
  password: "123456", // 원하는 비밀번호로 변경하세요
};

type SimpleUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  session: { user: SimpleUser } | null;
  user: SimpleUser | null;
  initializing: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ error?: string; session?: { user: SimpleUser } | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_STORAGE_KEY = "@auth_session";

const DEMO_SESSION = { user: { id: "demo", email: "demo@scaffold.app" } };


export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: SimpleUser } | null>(DEMO_SESSION);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      setInitializing(false); // just skip straight to done
    };

    loadSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      // 이메일과 비밀번호 확인
      const normalizedEmail = email.trim().toLowerCase();
      if (
        normalizedEmail === ALLOWED_CREDENTIALS.email.toLowerCase() &&
        password === ALLOWED_CREDENTIALS.password
      ) {
        const user: SimpleUser = {
          id: "1",
          email: normalizedEmail,
        };
        const newSession = { user };
        setSession(newSession);
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        return {};
      } else {
        return { error: "Invalid email or password." };
      }
    } catch (err) {
      console.error("Sign-in error", err);
      return { error: "Something went wrong while signing in." };
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    setAuthLoading(true);
    try {
      // 간단한 회원가입 로직 (실제로는 저장하지 않음)
      const normalizedEmail = email.trim().toLowerCase();
      const user: SimpleUser = {
        id: Date.now().toString(),
        email: normalizedEmail,
      };
      const newSession = { user };
      setSession(newSession);
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      return { session: newSession };
    } catch (err) {
      console.error("Sign-up error", err);
      return { error: "Something went wrong while creating your account." };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setSession(null);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn("Sign-out error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        initializing,
        authLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
