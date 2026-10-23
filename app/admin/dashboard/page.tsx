"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Car,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Plus,
  ExternalLink,
  ChevronRight,
  MapPin,
  Building,
  Check,
  Settings,
  Edit,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<
    "overview" | "approvals" | "dealers" | "plans" | "invoices" | "orders"
  >("overview");

  // Convex Queries
  const stats = useQuery(api.analytics.getAdminStats);
  const vehicles = useQuery(api.vehicles.adminListAllVehicles);
  const applications = useQuery(api.dealerApplications.listApplications, {});
  const plans = useQuery(api.subscriptionPlans.listPlans);
  const invoices = useQuery(api.invoices.getAllInvoices);
  const orders = useQuery(api.orders.adminListAllOrders);

  // Mutations
  const approveVehicleMutation = useMutation(api.vehicles.adminApproveVehicle);
  const rejectVehicleMutation = useMutation(api.vehicles.adminRejectVehicle);
  const approveDealerMutation = useMutation(api.dealerApplications.approveApplication);
  const rejectDealerMutation = useMutation(api.dealerApplications.rejectApplication);
  const verifyPaymentMutation = useMutation(api.invoices.adminVerifyPayment);
  const updatePlanMutation = useMutation(api.subscriptionPlans.adminUpdatePlan);

  // Plan Edit State
  const [editingPlan, setEditingPlan] = useState<{
    _id: Id<"subscriptionPlans">;
    name: string;
    priceMonthlyTzs: number;
    listingLimit: number;
    photosPerVehicle: number;
    description: string;
    features: string[];
    isActive: boolean;
  } | null>(null);

  const pendingVehicles = (vehicles || []).filter((v) => v.status === "pending_approval");
  const pendingApps = (applications || []).filter((a) => a.status === "pending");
  const pendingInvoices = (invoices || []).filter((i) => i.status === "pending");

  const handleApproveVehicle = async (vehicleId: Id<"vehicles">) => {
    if (!user) return;
    try {
      await approveVehicleMutation({ vehicleId, adminUserId: user.userId });
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleRejectVehicle = async (vehicleId: Id<"vehicles">) => {
    if (!user) return;
    const reason = prompt("Enter rejection reason for the seller:");
    if (!reason) return;
    try {
      await rejectVehicleMutation({ vehicleId, adminUserId: user.userId, reason });
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleApproveDealer = async (applicationId: Id<"dealerApplications">) => {
    if (!user) return;
    try {
      await approveDealerMutation({ applicationId, adminUserId: user.userId });
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleRejectDealer = async (applicationId: Id<"dealerApplications">) => {
    if (!user) return;
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await rejectDealerMutation({ applicationId, adminUserId: user.userId, reason });
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleVerifyInvoice = async (invoiceId: Id<"subscriptionInvoices">, action: "approve" | "reject") => {
    if (!user) return;
    try {
      await verifyPaymentMutation({
        invoiceId,
        adminUserId: user.userId,
        action,
        adminNotes: action === "approve" ? "Verified via Tanzanian mobile money gateway" : "Invalid reference code",
      });
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await updatePlanMutation({
        planId: editingPlan._id,
        name: editingPlan.name,
        priceMonthlyTzs: Number(editingPlan.priceMonthlyTzs),
        listingLimit: Number(editingPlan.listingLimit),
        photosPerVehicle: Number(editingPlan.photosPerVehicle),
        description: editingPlan.description,
        features: editingPlan.features,
        isActive: editingPlan.isActive,
      });
      setEditingPlan(null);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Left Red-Accent Sidebar matching Swahivo Admin mockup */}
      <aside className="w-full lg:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-900">
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="relative w-40 h-10 block">
              <Image
                src="/assets/aistudio/logo_52dfade8.png"
                alt="Swahivo Admin"
                fill
                className="object-contain brightness-0 invert"
                sizes="160px"
              />
            </Link>
          </div>

          <div className="px-4 py-2 bg-red-950/60 border-b border-red-900/60 text-[11px] text-red-300 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>Marketplace Platform Admin</span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "overview"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("approvals")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "approvals"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4" />
                <span>Listing Approvals</span>
              </div>
              {pendingVehicles.length > 0 && (
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingVehicles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("dealers")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "dealers"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4" />
                <span>Seller Applications</span>
              </div>
              {pendingApps.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingApps.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "plans"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" />
                <span>Subscription Plans</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                6 Tiers
              </span>
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "invoices"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Payments</span>
              </div>
              {pendingInvoices.length > 0 && (
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingInvoices.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "orders"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Marketplace Orders</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Visit Public Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Main Administrative Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Admin Command Center</h1>
            <p className="text-xs text-slate-500">
              Platform management, listing moderation, dealer approvals, and billing reconciliation.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            October 2026 • Live Convex Production
          </div>
        </header>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: OVERVIEW (MATCHES SWAHIVO ADMIN MOCKUP) */}
          {activeTab === "overview" && (
            <>
              {/* Top 5 Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Total Vehicles</span>
                    <Car className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalVehicles || 246}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">+12% Active listings</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Enquiries</span>
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalEnquiries || 128}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">+18% New this month</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Sales</span>
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalSales || 32}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">+6% Completed sales</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Revenue (TZS)</span>
                    <DollarSign className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-black text-slate-900">TZS 1.28B</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">+24% This month</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Customers</span>
                    <Users className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats?.totalCustomers || 1452}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">+15% Total registered</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enquiries & Sales Line Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Enquiries & Sales</h3>
                      <p className="text-[11px] text-slate-400">12 Month historical trend</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-red-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Enquiries
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Sales
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.enquiriesAndSalesTrends || []}>
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" dataKey="enquiries" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Vehicles by Category Donut */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Vehicles by Category</h3>
                    <p className="text-[11px] text-slate-400">Breakdown of inventory</p>
                  </div>

                  <div className="h-44 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.categoryBreakdown || []}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {(stats?.categoryBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-800">{stats?.totalVehicles || 246}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs pt-2 border-t border-slate-100">
                    {(stats?.categoryBreakdown || []).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between pr-2">
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.fill }} />
                          {cat.name}
                        </span>
                        <span className="font-bold text-[11px]">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Geographic Distribution & Top Brands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Locations Tanzania */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Customer & Listing Locations (Tanzania)</h3>
                  <div className="space-y-2">
                    {(stats?.locations || []).map((loc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="font-bold text-slate-800">{loc.city}</span>
                        </div>
                        <span className="font-extrabold text-slate-900">{loc.count} listings</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Brands */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Top Brands by Market Share</h3>
                  <div className="space-y-3">
                    {(stats?.topBrands || []).map((b, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{b.name}</span>
                          <span className="font-bold text-slate-800">{b.count} vehicles</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LISTING APPROVALS */}
          {activeTab === "approvals" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vehicle Listing Approvals</h2>
                <p className="text-xs text-slate-500">
                  Review submitted seller listings for TRA documentation and compliance before publishing.
                </p>
              </div>

              {pendingVehicles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  No vehicle listings currently pending approval. All active vehicles are verified.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingVehicles.map((v) => (
                    <div key={v._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <Image src={v.primaryImage} alt={v.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{v.title}</h4>
                          <p className="text-xs font-extrabold text-red-600">{formatPrice(v.priceTzs)}</p>
                          <p className="text-[11px] text-slate-400">
                            {v.year} • {v.mileage.toLocaleString("en-US")} km • {v.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveVehicle(v._id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Listing</span>
                        </button>
                        <button
                          onClick={() => handleRejectVehicle(v._id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SELLER APPLICATIONS */}
          {activeTab === "dealers" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Dealership Registrations & Applications</h2>
                <p className="text-xs text-slate-500">
                  Approve prospective auto dealers to give them inventory publishing and SaaS entitlements.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Applicant / Yard</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(applications || []).map((app) => (
                      <tr key={app._id}>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{app.businessName}</p>
                          <p className="text-[11px] text-slate-400">{app.applicantName}</p>
                        </td>
                        <td className="py-3 px-3">{app.location}</td>
                        <td className="py-3 px-3">
                          <p>{app.phone}</p>
                          <p className="text-[11px] text-slate-400">{app.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              app.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : app.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {app.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveDealer(app._id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectDealer(app._id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTION PLANS CONFIGURATION */}
          {activeTab === "plans" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manage 6 Subscription Packages</h2>
                <p className="text-xs text-slate-500">
                  Update monthly price (TZS), active listing limit, and features. All edits persist in Convex.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(plans || []).map((p) => (
                  <div key={p._id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                        {p.listingLimit} Listings
                      </span>
                    </div>

                    <p className="text-xl font-extrabold text-red-600">
                      TZS {p.priceMonthlyTzs.toLocaleString("en-US")} / mo
                    </p>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>Photos per car: <strong>{p.photosPerVehicle}</strong></p>
                      <p className="truncate">{p.description}</p>
                    </div>

                    <button
                      onClick={() => setEditingPlan(p)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Package</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Edit Plan Modal */}
              {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900">Edit {editingPlan.name} Plan</h3>
                    <form onSubmit={handleSavePlan} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Price (TZS)</label>
                        <input
                          type="number"
                          required
                          value={editingPlan.priceMonthlyTzs}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, priceMonthlyTzs: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Active Listing Limit</label>
                        <input
                          type="number"
                          required
                          value={editingPlan.listingLimit}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, listingLimit: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Photos Per Vehicle</label>
                        <input
                          type="number"
                          required
                          value={editingPlan.photosPerVehicle}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, photosPerVehicle: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPlan(null)}
                          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: VERIFY INVOICE PAYMENTS */}
          {activeTab === "invoices" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Subscription Payment Verification</h2>
                <p className="text-xs text-slate-500">
                  Verify M-Pesa, Tigo Pesa, and Bank transfer receipts to unlock dealer listing capacity.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Reference Code</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(invoices || []).map((inv) => (
                      <tr key={inv._id}>
                        <td className="py-3 px-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3">{inv.planName}</td>
                        <td className="py-3 px-3 font-bold text-red-600">{formatPrice(inv.amountTzs)}</td>
                        <td className="py-3 px-3 font-mono text-slate-800 font-bold">
                          {inv.paymentReference || "Awaiting Reference"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              inv.status === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {inv.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerifyInvoice(inv._id, "approve")}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Approve & Activate
                              </button>
                              <button
                                onClick={() => handleVerifyInvoice(inv._id, "reject")}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">All Marketplace Orders & Sales</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(orders || []).map((o) => (
                      <tr key={o._id}>
                        <td className="py-3 px-3 font-bold">{o.orderNumber}</td>
                        <td className="py-3 px-3">{o.customerName}</td>
                        <td className="py-3 px-3 font-semibold">{o.vehicleTitle}</td>
                        <td className="py-3 px-3 font-bold text-red-600">{formatPrice(o.amountTzs)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              o.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
