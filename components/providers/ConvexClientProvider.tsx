"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const DEFAULT_CONVEX_URL = "https://tame-hummingbird-649.convex.cloud";

function resolveConvexUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_CONVEX_URL,
    process.env.VITE_CONVEX_URL,
    process.env.CONVEX_URL,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      // Ensure candidate is an absolute HTTP/HTTPS URL and not a deploy key
      if (
        (trimmed.startsWith("https://") || trimmed.startsWith("http://")) &&
        !trimmed.includes("|")
      ) {
        return trimmed;
      }
    }
  }

  return DEFAULT_CONVEX_URL;
}

export const convexClient = new ConvexReactClient(resolveConvexUrl());

// --- Auth Context ---
export interface AuthUser {
  userId: Id<"users">;
  name: string;
  email: string;
  role: "admin" | "seller" | "buyer";
  phone?: string;
  avatarUrl?: string;
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role: string; status?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "buyer" | "seller";
    phone?: string;
    businessName?: string;
    businessLocation?: string;
    businessDescription?: string;
    planSlug?: string;
  }) => Promise<{ success: boolean; role: string; status?: string }>;
  logout: () => void;
  switchUser: (role: "admin" | "seller" | "buyer") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Currency Context (TZS / USD) ---
interface CurrencyContextType {
  currency: "TZS" | "USD";
  setCurrency: (c: "TZS" | "USD") => void;
  exchangeRate: number;
  formatPrice: (amountTzs: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function AppProvidersInner({ children }: { children: ReactNode }) {
  // Exchange rate query from Convex
  const rateData = useQuery(api.exchangeRates.getExchangeRate);

  // Hydration-safe state: SSR and initial client render start identical (currency = "TZS", user = null)
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrencyState] = useState<"TZS" | "USD">("TZS");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const savedCurrency = localStorage.getItem("swahivo_currency");
        if (savedCurrency === "USD" || savedCurrency === "TZS") {
          setCurrencyState(savedCurrency);
        } else {
          setCurrencyState("TZS");
        }

        const savedSession = localStorage.getItem("swahivo_session");
        if (savedSession) {
          setUser(JSON.parse(savedSession));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Storage sync error:", err);
      }
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("swahivo_currency_change", syncFromStorage);
    window.addEventListener("swahivo_session_change", syncFromStorage);

    const frameId = requestAnimationFrame(() => {
      setIsMounted(true);
      syncFromStorage();
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("swahivo_currency_change", syncFromStorage);
      window.removeEventListener("swahivo_session_change", syncFromStorage);
    };
  }, []);

  const setCurrency = useCallback((c: "TZS" | "USD") => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("swahivo_currency", c);
      window.dispatchEvent(new Event("swahivo_currency_change"));
    }
  }, []);

  const exchangeRate = rateData?.rate || 0.000385; // 1 TZS = 0.000385 USD (~2600 TZS per USD)

  const formatPrice = useCallback(
    (amountTzs: number) => {
      if (currency === "USD") {
        const usd = Math.round(amountTzs * exchangeRate);
        return `$${usd.toLocaleString("en-US")}`;
      }
      return `TZS ${amountTzs.toLocaleString("en-US")}`;
    },
    [currency, exchangeRate]
  );

  const loginMutation = useMutation(api.users.login);
  const registerMutation = useMutation(api.users.register);

  const login = async (email: string, pass: string) => {
    const res = await loginMutation({ email, password: pass });
    const authUser: AuthUser = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role as "admin" | "seller" | "buyer",
      phone: res.phone,
      avatarUrl: res.avatarUrl,
      status: res.status,
    };
    setUser(authUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("swahivo_session", JSON.stringify(authUser));
      window.dispatchEvent(new Event("swahivo_session_change"));
    }
    return { success: true, role: res.role, status: res.status };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: "buyer" | "seller";
    phone?: string;
    businessName?: string;
    businessLocation?: string;
    businessDescription?: string;
    planSlug?: string;
  }) => {
    const res = await registerMutation(data);
    const authUser: AuthUser = {
      userId: res.userId,
      name: res.name,
      email: res.email,
      role: res.role as "admin" | "seller" | "buyer",
      phone: res.phone,
      status: res.status,
    };
    setUser(authUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("swahivo_session", JSON.stringify(authUser));
      window.dispatchEvent(new Event("swahivo_session_change"));
    }
    return { success: true, role: res.role, status: res.status };
  };

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("swahivo_session");
      window.dispatchEvent(new Event("swahivo_session_change"));
    }
  }, []);

  const switchUser = useCallback(
    async (targetRole: "admin" | "seller" | "buyer") => {
      try {
        if (targetRole === "admin") {
          await login("admin@swahivo.com", "admin123");
        } else if (targetRole === "seller") {
          await login("ali.hassan@swahivo.com", "ali123");
        } else {
          await login("salim.khamis@example.com", "buyer123");
        }
      } catch (e) {
        console.error("Quick switch error:", e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loginMutation]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading: !isMounted, login, register, logout, switchUser }}>
      <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, formatPrice }}>
        {children}
      </CurrencyContext.Provider>
    </AuthContext.Provider>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convexClient}>
      <AppProvidersInner>{children}</AppProvidersInner>
    </ConvexProvider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within ConvexClientProvider");
  return context;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within ConvexClientProvider");
  return context;
};
