"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VehicleFilterBar } from "@/components/vehicles/VehicleFilterBar";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { useCurrency } from "@/components/providers/ConvexClientProvider";
import {
  ShieldCheck,
  Award,
  CreditCard,
  Headphones,
  ArrowRight,
  Car,
  Sparkles,
  Zap,
  Wrench,
  Bike,
  Star,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const { formatPrice, currency } = useCurrency();
  const [filterState, setFilterState] = useState<{
    brand?: string;
    condition?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
  }>({});

  // Live vehicles from Convex
  const vehicles = useQuery(api.vehicles.listPublicVehicles, filterState);
  const categories = useQuery(api.meta.listCategories);
  const reviews = useQuery(api.meta.listReviews);
  const plans = useQuery(api.subscriptionPlans.listPlans);

  const handleSearch = (filters: {
    brand?: string;
    condition?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
  }) => {
    setFilterState(filters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-slate-950 text-white overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-24">
          {/* Background showroom glow */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Image
              src="/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"
              alt="Swahivo Dealership"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block text-[11px] sm:text-xs font-bold text-red-500 uppercase tracking-widest bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
                PREMIUM CARS. REAL PEOPLE. BETTER JOURNEYS.
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Find Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-red-500">
                  Perfect Drive
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Swahivo Car Dealership brings you a wide range of new and pre-owned vehicles with trusted service,
                flexible finance options, and a smooth buying experience across Tanzania & Zanzibar.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/cars"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-red-600/30 flex items-center gap-2"
                >
                  <span>Browse All Cars</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dealers"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold transition backdrop-blur-xs"
                >
                  Explore Showrooms
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="px-4 sm:px-6 lg:px-8">
          <VehicleFilterBar onSearch={handleSearch} />
        </section>

        {/* 4 Trust Value Props */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Verified Listings</h4>
                <p className="text-[11px] text-slate-500">Full TRA Documentation</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Dealer Warranty</h4>
                <p className="text-[11px] text-slate-500">Peace of Mind</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Flexible Finance</h4>
                <p className="text-[11px] text-slate-500">Easy Monthly Plans</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Expert Support</h4>
                <p className="text-[11px] text-slate-500">Here for You Always</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Car Categories */}
        <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Explore Our Range</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Popular Car Categories</h2>
            </div>
            <Link
              href="/cars"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { title: "New Cars", sub: "Latest Models", icon: Sparkles, count: "82 listings", filter: "New" },
              { title: "Used Cars", sub: "Quality Pre-owned", icon: Car, count: "96 listings", filter: "Used" },
              { title: "Accessories", sub: "Genuine Parts", icon: Wrench, count: "24 items", href: "/accessories" },
              { title: "Motorbikes", sub: "Explore Bikes", icon: Bike, count: "18 listings", filter: "Motorbike" },
              { title: "Electric & Hybrid", sub: "Eco-Friendly", icon: Zap, count: "16 listings", filter: "Hybrid" },
              { title: "Commercial", sub: "Trucks & Vans", icon: Award, count: "10 listings", filter: "Used" },
            ].map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (cat.href) window.location.href = cat.href;
                  else if (cat.filter) setFilterState({ condition: cat.filter });
                }}
                className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-red-500/60 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-50 group-hover:text-red-600 text-slate-700 flex items-center justify-center mb-3 transition">
                  <cat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{cat.sub}</p>
                <span className="inline-block mt-2 text-[10px] text-slate-400 font-semibold">{cat.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Vehicles in Tanzania */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Featured Vehicles in Tanzania</h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified listings with full TRA documentation, warranty, and seller guarantees.
              </p>
            </div>
            <Link
              href="/cars"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>View All Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {vehicles === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Car className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No vehicles match your current search criteria</h3>
              <p className="text-xs text-slate-500">Try clearing filters or search for another vehicle make.</p>
              <button
                onClick={() => setFilterState({})}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </div>
          )}
        </section>

        {/* Drive Your Dreams Banner with Real Stats */}
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                    Drive Your Dreams <br />
                    with <span className="text-red-500">Swahivo</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                    Quality vehicles, trusted service, and flexible finance options across Dar es Salaam, Zanzibar,
                    Arusha, and Mwanza. Your journey starts here.
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/cars"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-red-600/30"
                    >
                      <span>Explore Our Cars</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-500">500+</span>
                    <p className="text-xs font-semibold text-slate-300 mt-1">Vehicles Available</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-500">10K+</span>
                    <p className="text-xs font-semibold text-slate-300 mt-1">Happy Customers</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-500">100%</span>
                    <p className="text-xs font-semibold text-slate-300 mt-1">Verified Listings</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-red-500">5 Star</span>
                    <p className="text-xs font-semibold text-slate-300 mt-1">Customer Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What Our Customers Say</h2>
            <p className="text-xs text-slate-500">Real experiences from happy Swahivo buyers in East Africa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews || [
              {
                authorName: "Ahmed S.",
                authorLocation: "Dar es Salaam",
                rating: 5,
                comment: "Amazing service and genuine cars. Swahivo made the whole buying process so easy! Registration and inspection were handled seamlessly.",
              },
              {
                authorName: "Fatma A.",
                authorLocation: "Zanzibar",
                rating: 5,
                comment: "I got my dream car with flexible payments. Highly recommend Swahivo to anyone looking for trusted auto dealers in East Africa!",
              },
              {
                authorName: "Juma M.",
                authorLocation: "Arusha",
                rating: 5,
                comment: "Professional, transparent, and trustworthy. The best car dealership marketplace in Tanzania with verified listings.",
              },
            ]).map((rev, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.authorName}</h4>
                    <p className="text-[10px] text-slate-400">{rev.authorLocation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dealer Subscription Packages CTA Preview */}
        <section className="py-14 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              SaaS FOR CAR DEALERS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold">Grow Your Dealership with Swahivo</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Choose from 6 transparent subscription packages with strict active vehicle listing quotas, CRM tools,
              analytics, and verified customer enquiries.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/pricing"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-red-600/30 flex items-center gap-2"
              >
                <span>View All 6 Subscription Tiers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/seller/dashboard"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition border border-slate-700"
              >
                Open Seller Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
