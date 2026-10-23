"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/ConvexClientProvider";
import { X, Lock, Mail, User, Phone, Building, MapPin, AlertCircle, CheckCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        setSuccessMsg(`Welcome back! Redirecting to ${res.role} dashboard...`);
        setTimeout(() => {
          onClose();
          if (res.role === "admin") router.push("/admin/dashboard");
          else if (res.role === "seller") router.push("/seller/dashboard");
          else router.push("/account");
        }, 800);
      } else {
        const res = await register({
          name,
          email,
          password,
          role,
          phone,
          businessName: role === "seller" ? businessName : undefined,
          businessLocation: role === "seller" ? businessLocation : undefined,
          businessDescription: role === "seller" ? businessDescription : undefined,
        });

        setSuccessMsg("Account successfully created!");
        setTimeout(() => {
          onClose();
          if (res.role === "seller") router.push("/seller/dashboard");
          else router.push("/account");
        }, 800);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected authentication error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {mode === "login" ? "Sign In to Swahivo" : "Create Your Swahivo Account"}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "login"
                ? "Access your dashboard, saved vehicles, and bookings"
                : "Join Tanzania's trusted automotive marketplace"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Test Accounts Bar */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-1.5">
          <span className="font-semibold text-slate-600">Quick sign-in:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@swahivo.com", "admin123")}
              className="px-2 py-0.5 bg-slate-200 hover:bg-red-600 hover:text-white rounded text-[11px] font-medium transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("ali.hassan@swahivo.com", "ali123")}
              className="px-2 py-0.5 bg-slate-200 hover:bg-red-600 hover:text-white rounded text-[11px] font-medium transition"
            >
              Seller (Ali)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("salim.khamis@example.com", "buyer123")}
              className="px-2 py-0.5 bg-slate-200 hover:bg-red-600 hover:text-white rounded text-[11px] font-medium transition"
            >
              Buyer (Salim)
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "register" && (
            <>
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">I am registering as:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      role === "buyer"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Car Buyer / Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      role === "seller"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Car Dealer / Seller
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Salim Khamis"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Tanzania)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 770 000 000"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Additional Dealer Fields */}
              {role === "seller" && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Dealership Information
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Business Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Zanzibar Auto Hub"
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Business Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={businessLocation}
                        onChange={(e) => setBusinessLocation(e.target.value)}
                        placeholder="e.g. Kiembe Samaki, Zanzibar"
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Business Description</label>
                    <textarea
                      rows={2}
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Brief summary of vehicle types you sell..."
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
            {mode === "register" && (
              <p className="text-[10px] text-slate-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        {/* Footer switch */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-red-600 font-bold hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-red-600 font-bold hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
