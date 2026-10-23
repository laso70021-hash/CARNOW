"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/ConvexClientProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      setSuccess(`Signed in! Redirecting to ${res.role} dashboard...`);
      setTimeout(() => {
        if (res.role === "admin") router.push("/admin/dashboard");
        else if (res.role === "seller") router.push("/seller/dashboard");
        else router.push("/account");
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="relative w-36 h-10 mx-auto">
              <Image
                src="/assets/aistudio/logo_52dfade8.png"
                alt="Swahivo"
                fill
                className="object-contain"
                sizes="150px"
              />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Sign In to Your Account</h1>
            <p className="text-xs text-slate-500">Access buyer orders, vehicle inventory, or administration</p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500">Quick Credentials:</span>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@swahivo.com");
                  setPassword("admin123");
                }}
                className="p-1.5 bg-white rounded-lg border border-slate-200 hover:border-red-500 font-semibold text-slate-700"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("ali.hassan@swahivo.com");
                  setPassword("ali123");
                }}
                className="p-1.5 bg-white rounded-lg border border-slate-200 hover:border-red-500 font-semibold text-slate-700"
              >
                Seller (Ali)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("salim.khamis@example.com");
                  setPassword("buyer123");
                }}
                className="p-1.5 bg-white rounded-lg border border-slate-200 hover:border-red-500 font-semibold text-slate-700"
              >
                Buyer (Salim)
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

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
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-red-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
