"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Building, MapPin, Phone, Mail, CheckCircle, Star, ArrowRight } from "lucide-react";

export default function DealersPage() {
  const dealers = useQuery(api.dealers.listAllDealers);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            CERTIFIED CAR YARDS
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Verified Dealerships in Tanzania & Zanzibar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Connect with authorized automotive dealerships. Every partner yard is vetted for business registration,
            TRA tax compliance, and verified vehicle titles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(dealers || []).map((dealer) => (
            <div
              key={dealer._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-red-500/50 transition duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl border border-red-100">
                    <Building className="w-7 h-7" />
                  </div>
                  {dealer.isVerified && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified Dealer
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{dealer.businessName}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{dealer.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({dealer.reviewCount} reviews)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {dealer.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{dealer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dealer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {dealer.activeListingCount || 12} cars in stock
                </span>
                <Link
                  href={`/cars`}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <span>View Inventory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
