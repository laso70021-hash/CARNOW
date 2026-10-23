"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Car,
  Heart,
  MessageSquare,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Building2,
  ShieldCheck,
  DollarSign,
  PlusCircle,
  LogOut,
  Bell,
} from "lucide-react";
import { AuthModal } from "@/components/modals/AuthModal";

export function Navbar() {
  const { user, logout, switchUser } = useAuth();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Favorites count
  const favorites = useQuery(
    api.favorites.getFavorites,
    user?.userId ? { userId: user.userId } : "skip"
  );

  // Unread notifications
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    user?.userId ? { userId: user.userId } : "skip"
  );
  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <>
      {/* Top Notification / Currency Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Dealerships in Tanzania & Zanzibar
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">
              Hotline: <strong className="text-white">+255 770 565 656</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Demo Switcher for fast evaluation */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded text-[11px] text-slate-300">
              <span className="text-slate-400">Role:</span>
              <button
                onClick={() => switchUser("admin")}
                className={`px-1.5 py-0.5 rounded transition ${user?.role === "admin" ? "bg-red-600 text-white font-medium" : "hover:text-white"}`}
              >
                Admin
              </button>
              <button
                onClick={() => switchUser("seller")}
                className={`px-1.5 py-0.5 rounded transition ${user?.role === "seller" ? "bg-red-600 text-white font-medium" : "hover:text-white"}`}
              >
                Seller (Ali)
              </button>
              <button
                onClick={() => switchUser("buyer")}
                className={`px-1.5 py-0.5 rounded transition ${user?.role === "buyer" ? "bg-red-600 text-white font-medium" : "hover:text-white"}`}
              >
                Buyer (Salim)
              </button>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-800 rounded p-0.5 text-xs font-semibold">
              <button
                onClick={() => setCurrency("TZS")}
                className={`px-2 py-0.5 rounded transition ${currency === "TZS" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                TZS
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2 py-0.5 rounded transition ${currency === "USD" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-44 h-12">
              <Image
                src="/assets/aistudio/logo_52dfade8.png"
                alt="Swahivo Car Dealership"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 150px, 180px"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-red-600 transition">
              Home
            </Link>
            <Link href="/cars" className="hover:text-red-600 transition">
              Cars
            </Link>
            <Link href="/accessories" className="hover:text-red-600 transition">
              Accessories
            </Link>
            <Link href="/services" className="hover:text-red-600 transition">
              Services
            </Link>
            <Link href="/pricing" className="hover:text-red-600 transition text-red-600 flex items-center gap-1">
              <span>Pricing</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-bold">
                6 Plans
              </span>
            </Link>
            <Link href="/dealers" className="hover:text-red-600 transition">
              Dealers
            </Link>
            <Link href="/about" className="hover:text-red-600 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-red-600 transition">
              Contact
            </Link>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Favorites Icon */}
            <Link
              href={user ? "/account?tab=saved" : "/cars"}
              className="relative p-2 text-slate-600 hover:text-red-600 transition rounded-full hover:bg-slate-100"
              title="Saved Vehicles"
            >
              <Heart className="w-5 h-5" />
              {favorites && favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Enquiries / Messages Icon */}
            {user && (
              <Link
                href={
                  user.role === "seller"
                    ? "/seller/dashboard/enquiries"
                    : user.role === "admin"
                    ? "/admin/dashboard?tab=enquiries"
                    : "/account?tab=enquiries"
                }
                className="relative p-2 text-slate-600 hover:text-red-600 transition rounded-full hover:bg-slate-100"
                title="Messages & Enquiries"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {user.role === "seller" ? 5 : 2}
                </span>
              </Link>
            )}

            {/* User Profile / Dashboard Link */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="relative w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" sizes="32px" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden md:block text-left pr-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] uppercase font-semibold text-red-600 tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-semibold uppercase">
                        {user.role} Dashboard
                      </span>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    {user.role === "seller" && (
                      <>
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                        >
                          <Building2 className="w-4 h-4 text-red-600" />
                          Seller Dashboard
                        </Link>
                        <Link
                          href="/seller/dashboard/vehicles/new"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                          Add Vehicle Listing
                        </Link>
                        <Link
                          href="/seller/dashboard/subscription"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                        >
                          <DollarSign className="w-4 h-4 text-amber-600" />
                          My Subscription
                        </Link>
                      </>
                    )}

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      Buyer Profile & Orders
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-sm hover:shadow"
                >
                  Register
                </button>
              </div>
            )}

            {/* Visit Showroom / Sell Car CTA */}
            <Link
              href={user?.role === "seller" ? "/seller/dashboard/vehicles/new" : "/pricing"}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-md hover:shadow-lg"
            >
              <span>{user?.role === "seller" ? "+ Add Vehicle" : "Sell Your Car"}</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-slate-700 hover:text-red-600 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              Browse Cars
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-red-600 hover:bg-red-50"
            >
              Dealer Subscription Plans (6 Tiers)
            </Link>
            <Link
              href="/dealers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              Car Dealerships
            </Link>
            <Link
              href="/accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              Accessories
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              Services
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              About Swahivo
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact Us
            </Link>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "seller"
                        ? "/seller/dashboard"
                        : "/account"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-red-600 text-white rounded-lg font-bold text-xs"
                  >
                    Go to {user.role.toUpperCase()} Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-red-600 text-white rounded-lg font-bold text-xs"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
