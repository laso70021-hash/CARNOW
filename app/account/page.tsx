"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import {
  Car,
  Heart,
  MessageSquare,
  ShoppingBag,
  Clock,
  CheckCircle,
  Calendar,
  CreditCard,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronRight,
  Bell,
  Trash2,
} from "lucide-react";
import { FinancingModal } from "@/components/modals/FinancingModal";

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const buyerId = user?.userId;

  // Queries
  const favorites = useQuery(api.favorites.getFavorites, buyerId ? { userId: buyerId } : "skip");
  const enquiries = useQuery(api.enquiries.getBuyerEnquiries, buyerId ? { buyerId } : "skip");
  const bookings = useQuery(api.bookings.getBuyerBookings, buyerId ? { buyerId } : "skip");
  const orders = useQuery(api.orders.getBuyerOrders, buyerId ? { buyerId } : "skip");
  const recommendedVehicles = useQuery(api.vehicles.listPublicVehicles, { onlyFeatured: true });
  const notifications = useQuery(api.notifications.getUserNotifications, buyerId ? { userId: buyerId } : "skip");

  const [financeModalOpen, setFinanceModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="absolute inset-0 opacity-25">
            <Image
              src="/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"
              alt="Swahivo"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center border-2 border-white/20 shadow-lg">
                {user?.name ? user.name.charAt(0) : "S"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{user?.name || "Salim Khamis"}</h1>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified Buyer
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Find, explore, and drive your dream car with trusted seller guarantees.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {user?.email || "salim.khamis@example.com"} • {user?.phone || "+255 771 234 567"}
                </p>
              </div>
            </div>

            <Link
              href="/cars"
              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md"
            >
              <span>Browse All Cars</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">{favorites?.length || 3}</span>
              <p className="text-xs text-slate-500 font-medium">Saved Cars</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">{enquiries?.length || 5}</span>
              <p className="text-xs text-slate-500 font-medium">Total Enquiries</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">
                {(orders?.length || 0) + (bookings?.length || 2)}
              </span>
              <p className="text-xs text-slate-500 font-medium">Orders / Bookings</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">12</span>
              <p className="text-xs text-slate-500 font-medium">Search History</p>
            </div>
          </div>
        </div>

        {/* Section: Saved Cars */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Saved Cars ({favorites?.length || 0})</h2>
            <Link href="/cars" className="text-xs font-bold text-red-600 hover:underline">
              Browse More Cars &rarr;
            </Link>
          </div>

          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites
                .filter((v): v is NonNullable<typeof v> => v !== null)
                .map((v) => (
                  <VehicleCard key={v._id} vehicle={v} />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
              You haven&apos;t saved any vehicles yet. Click the heart icon on any listing to view it here.
            </div>
          )}
        </section>

        {/* Orders / Bookings & Enquiries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders & Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">My Orders & Bookings</h3>

            {/* Visual Tracking Timeline */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Toyota Land Cruiser 300 VXR</h4>
                  <p className="text-[10px] text-slate-400">Order #SWV00123 • Oct 20, 2026</p>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">
                  Processing
                </span>
              </div>

              {/* Progress Steps */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                  <span className="text-emerald-600 font-bold">Placed</span>
                  <span className="text-emerald-600 font-bold">Payment Verified</span>
                  <span className="text-blue-600 font-bold">TRA Escrow</span>
                  <span>Delivery</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="w-3/4 bg-red-600 rounded-full" />
                </div>
              </div>
            </div>

            {/* Scheduled Booking */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Test Drive: BMW 3 Series</h4>
                <p className="text-[11px] text-slate-500">Scheduled for Oct 25, 2026 at 10:00 AM</p>
                <p className="text-[10px] text-slate-400">Location: Kiembe Samaki Showroom, Zanzibar</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase">
                Confirmed
              </span>
            </div>
          </div>

          {/* Recent Enquiries */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Recent Enquiries</h3>
            <div className="divide-y divide-slate-100">
              {(enquiries && enquiries.length > 0 ? enquiries : [
                { vehicleTitle: "Toyota Land Cruiser", message: "Price and availability?", createdAt: 1729600000000, status: "new" },
                { vehicleTitle: "BMW 3 Series", message: "Is this still available for test drive?", createdAt: 1729590000000, status: "responded" },
                { vehicleTitle: "Ford Ranger", message: "Can I get finance assistance?", createdAt: 1729500000000, status: "pending" },
              ]).map((enq, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{enq.vehicleTitle}</h4>
                    <p className="text-slate-500 text-[11px] truncate max-w-xs">{enq.message}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      enq.status === "new"
                        ? "bg-red-100 text-red-700"
                        : enq.status === "responded"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financing Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              AUTO LOAN ASSISTANCE
            </span>
            <h3 className="text-xl sm:text-2xl font-black">Need Flexible Vehicle Financing?</h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              Apply for pre-qualification with partner Tanzanian banks with down payments starting at 20% and up to 60-month loan terms.
            </p>
          </div>
          <button
            onClick={() => setFinanceModalOpen(true)}
            className="px-6 py-3 bg-white text-red-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition shrink-0 shadow-lg"
          >
            Apply for Finance
          </button>
        </div>

        {/* Recommended for You */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recommendedVehicles?.slice(0, 3) || []).map((v) => (
              <VehicleCard key={v._id} vehicle={v} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <FinancingModal
        isOpen={financeModalOpen}
        onClose={() => setFinanceModalOpen(false)}
      />
    </div>
  );
}
