"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Award, Users, CheckCircle2, Building, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              ABOUT SWAHIVO CARS
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Transforming the Automotive Experience in East Africa
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Founded in Tanzania and Zanzibar, Swahivo Car Dealership is the premier automotive marketplace
              and multi-vendor SaaS platform connecting individual buyers, sellers, and professional car yards.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We eliminate common marketplace scams through strict verified dealership registration, physical vehicle
              inspections, genuine TRA tax compliance, and transparent pricing in both Tanzanian Shillings (TZS) and US Dollars.
            </p>

            <div className="pt-2 flex gap-4">
              <Link
                href="/cars"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Browse Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/pricing"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                <span>Join as a Dealer</span>
              </Link>
            </div>
          </div>

          <div className="relative aspect-16/10 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <Image
              src="/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"
              alt="Swahivo Showroom"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <ShieldCheck className="w-8 h-8 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">100% Verified TRA Titles</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every listing on Swahivo is screened for clean ownership, customs clearance, and roadworthy inspection.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <Award className="w-8 h-8 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">Dealer Subscription SaaS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empowering auto yards in Dar es Salaam, Zanzibar, and Arusha with inventory CRM, lead pipelines, and AI valuation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <Users className="w-8 h-8 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">Customer Escrow & Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct booking of test drives, flexible bank financing options, and dedicated Swahivo concierge assistance.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
