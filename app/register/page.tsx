"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/ConvexClientProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [selectedPlan, setSelectedPlan] = useState<string>("growth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const plans = [
    { slug: "free", name: "Free Tier", price: "TZS 0", listings: "1 Car", auto: true },
    { slug: "starter", name: "Starter", price: "TZS 45,000/mo", listings: "5 Cars", auto: false },
    { slug: "growth", name: "Growth", price: "TZS 95,000/mo", listings: "15 Cars", auto: false },
    { slug: "professional", name: "Professional", price: "TZS 185,000/mo", listings: "30 Cars", auto: false },
    { slug: "business", name: "Business", price: "TZS 350,000/mo", listings: "70 Cars", auto: false },
    { slug: "enterprise", name: "Enterprise", price: "TZS 650,000/mo", listings: "Unlimited", auto: false },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await register({
        name,
        email,
        password,
        role,
        phone,
        planSlug: role === "seller" ? selectedPlan : undefined,
        businessName: role === "seller" ? businessName : undefined,
        businessLocation: role === "seller" ? businessLocation : undefined,
        businessDescription: role === "seller" ? businessDescription : undefined,
      });

      if (role === "seller" && selectedPlan !== "free") {
        setSuccess("Account created! Placed ON HOLD pending subscription payment & admin verification.");
      } else {
        setSuccess("Account registered successfully! Redirecting...");
      }

      setTimeout(() => {
        if (res.role === "seller") router.push("/seller/dashboard");
        else router.push("/account");
      }, 900);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="relative w-36 h-10 mx-auto">
              <Image
                src="/assets/aistudio/logo_52dfade8.png"
                alt="Swahivo Company"
                fill
                className="object-contain"
                sizes="150px"
              />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Create Swahivo Account</h1>
            <p className="text-xs text-slate-500">
              Join as an individual car buyer or register your dealership yard for SaaS inventory management
            </p>
          </div>

          {/* Role Choice */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                role === "buyer"
                  ? "bg-red-50 border-red-500 text-red-700 shadow-xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Car Buyer / Individual
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                role === "seller"
                  ? "bg-red-50 border-red-500 text-red-700 shadow-xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Auto Dealership / Yard
            </button>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Salim Khamis"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 770 000 000"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
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
            </div>

            {role === "seller" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Select Dealership Subscription Plan
                    </p>
                    <Link href="/pricing" target="_blank" className="text-[10px] text-red-600 font-bold hover:underline">
                      View full plan details
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {plans.map((p) => {
                      const isSel = selectedPlan === p.slug;
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => setSelectedPlan(p.slug)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            isSel
                              ? "bg-red-50 border-red-500 ring-1 ring-red-500"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="text-[11px] font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] font-semibold text-red-600">{p.price}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{p.listings}</div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPlan === "free" ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Free tier activates automatically upon registration. No payment required.</span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Account placed ON HOLD until payment approval</span>
                      </div>
                      <p className="text-[10px] text-amber-800 leading-relaxed">
                        An invoice will be generated in your dashboard. Once you submit payment reference via M-Pesa / Tigo Pesa or Bank Transfer, Swahivo admins will verify and approve your account to go live.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Showroom Profile
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Business / Yard Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Zanzibar Auto Hub"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Showroom Location</label>
                    <input
                      type="text"
                      required
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      placeholder="e.g. Plot 42, Airport Road, Kiembe Samaki, Zanzibar"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Business Description</label>
                    <textarea
                      rows={2}
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Specialization, Japanese/European direct imports, warranty..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{" "}
            <Link href="/login" className="text-red-600 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
