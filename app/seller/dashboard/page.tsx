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
  Eye,
  Plus,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  Users,
  Settings,
  DollarSign,
  HelpCircle,
  X,
  SlidersHorizontal,
  LogOut,
  Bell,
  Search,
  Upload,
  Check,
  Trash2,
  ShieldCheck,
  Wrench,
  Image as ImageIcon,
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
  BarChart,
  Bar,
} from "recharts";
import { PaymentModal } from "@/components/modals/PaymentModal";

export default function SellerDashboardPage() {
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<
    "overview" | "vehicles" | "add_vehicle" | "enquiries" | "orders" | "subscription" | "profile"
  >("overview");

  const [vehicleFilter, setVehicleFilter] = useState<"all" | "active" | "pending_approval" | "inactive">("all");

  // Convex Queries
  const sellerId = user?.userId;
  const stats = useQuery(api.analytics.getSellerStats, sellerId ? { sellerId } : "skip");
  const vehicles = useQuery(
    api.vehicles.getSellerVehicles,
    sellerId ? { sellerId, status: vehicleFilter } : "skip"
  );
  const enquiries = useQuery(api.enquiries.getSellerEnquiries, sellerId ? { sellerId } : "skip");
  const orders = useQuery(api.orders.getSellerOrders, sellerId ? { sellerId } : "skip");
  const bookings = useQuery(api.bookings.getSellerBookings, sellerId ? { sellerId } : "skip");
  const subscription = useQuery(
    api.subscriptions.getSellerSubscription,
    sellerId ? { userId: sellerId } : "skip"
  );
  const dealerProfile = useQuery(
    api.dealers.getDealerByUserId,
    sellerId ? { userId: sellerId } : "skip"
  );
  const invoices = useQuery(
    api.invoices.getInvoicesForSeller,
    sellerId ? { userId: sellerId } : "skip"
  );

  // Mutations
  const createVehicleMutation = useMutation(api.vehicles.createVehicle);
  const setVehicleStatusMutation = useMutation(api.vehicles.setVehicleStatus);
  const addEnquiryReplyMutation = useMutation(api.enquiries.addEnquiryMessage);

  // Constants for Features & Equipment and Optional Services
  const FEATURE_CATEGORIES = [
    {
      category: "Safety & Security",
      items: [
        "Anti-lock Braking System (ABS)",
        "360° Panoramic Surround Camera",
        "Blind Spot Monitoring (BSM)",
        "Electronic Stability Control (ESC)",
        "Front & Curtain Airbags (8+)",
        "Lane Departure Warning & Keep Assist",
        "ISOFIX Child Seat Anchors",
        "Front & Rear Parking Sensors",
        "Engine Immobilizer & Anti-Theft Alarm",
      ],
    },
    {
      category: "Comfort & Interior",
      items: [
        "Premium Leather Seats",
        "Dual / Tri-Zone Automatic Climate Control",
        "Panoramic Electric Sunroof",
        "Heated & Ventilated Front Seats",
        "Power Adjustable Memory Seats",
        "Electric Tailgate / Smart Trunk",
        "Keyless Entry & Push-Button Start",
        "Ambient Interior LED Lighting",
        "Rear Passenger AC Vents & Sunshades",
      ],
    },
    {
      category: "Audio, Display & Tech",
      items: [
        "Apple CarPlay & Android Auto",
        "12.3-inch HD Touchscreen Infotainment",
        "Integrated GPS Satellite Navigation",
        "Wireless Smartphone Charging Pad",
        "Premium Surround Sound System",
        "Bluetooth Hands-Free & Audio Streaming",
        "Multi-Port Fast-Charge USB-C Ports",
        "Head-Up Display (HUD)",
      ],
    },
    {
      category: "Performance & Off-Road",
      items: [
        "Full-Time 4WD / All-Wheel Drive",
        "Electronic Rear Differential Lock",
        "Multi-Terrain Select (MTS) & Crawl Control",
        "Adaptive Height-Adjustable Air Suspension",
        "Heavy-Duty Tow Hitch & Trailer Wiring",
        "Hill Descent Control (HDC)",
        "Underbody Heavy-Duty Skid Plates",
        "Sport / Eco / Normal Drive Modes",
      ],
    },
    {
      category: "TRA & Import Compliance",
      items: [
        "100% TRA Customs Duty Fully Cleared",
        "Genuine Tanzania / Zanzibar Registration Logbook",
        "150-Point Pre-Purchase Inspection Passed",
        "Export Certificate & JEVIC Verified",
        "Single Owner History & Genuine Mileage",
        "Clear Title Ready for Immediate Transfer",
      ],
    },
  ];

  const OPTIONAL_SERVICES_DATA = [
    {
      id: "tra_registration",
      title: "TRA Registration & Title Transfer Service",
      description: "Fast, stress-free vehicle registration, logbook transfer, custom duty clearance, and number plate issuance across Tanzania and Zanzibar.",
      price: "From TZS 250,000",
    },
    {
      id: "inspection_150",
      title: "Comprehensive Pre-Purchase Inspection (150 Points)",
      description: "Detailed mechanical, computerized OBD diagnostic, structural chassis, engine compression, and paint thickness evaluation by certified engineers.",
      price: "TZS 180,000",
    },
    {
      id: "carrier_shipping",
      title: "Inter-City Vehicle Carrier & Shipping (Dar to Zanzibar)",
      description: "Insured vehicle transport between Dar es Salaam, Zanzibar ports, Arusha, Mwanza, Dodoma, and Mbeya on hydraulic flatbed trailers.",
      price: "From TZS 450,000",
    },
    {
      id: "scheduled_maintenance",
      title: "Scheduled Maintenance & Minor/Major Service",
      description: "Synthetic engine oil replacement, genuine oil filter, spark plugs, brake pads check, air filters, and suspension greasing.",
      price: "From TZS 150,000",
    },
  ];

  // New Vehicle Form State
  const [vTitle, setVTitle] = useState("");
  const [vBrand, setVBrand] = useState("Toyota");
  const [vModel, setVModel] = useState("");
  const [vVariant, setVVariant] = useState("");
  const [vCondition, setVCondition] = useState("Used");
  const [vYear, setVYear] = useState(2023);
  const [vMileage, setVMileage] = useState(15000);
  const [vFuel, setVFuel] = useState("Diesel");
  const [vTransmission, setVTransmission] = useState("Automatic");
  const [vEngine, setVEngine] = useState("3.0L");
  const [vPrice, setVPrice] = useState(45000000);
  const [vLocation, setVLocation] = useState("Dar es Salaam");
  const [vDesc, setVDesc] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "100% TRA Customs Duty Fully Cleared",
    "Genuine Tanzania / Zanzibar Registration Logbook",
    "Premium Leather Seats",
    "Panoramic Electric Sunroof",
    "360° Panoramic Surround Camera",
    "Apple CarPlay & Android Auto",
  ]);
  const [customFeature, setCustomFeature] = useState("");
  const [vImages, setVImages] = useState<string[]>([
    "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
  ]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedOptionalServices, setSelectedOptionalServices] = useState<string[]>([
    "TRA Registration & Title Transfer Service",
    "Comprehensive Pre-Purchase Inspection (150 Points)",
  ]);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [activeEnquiryId, setActiveEnquiryId] = useState<Id<"enquiries"> | null>(null);

  // Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{
    invoiceId: Id<"subscriptionInvoices">;
    invoiceNumber: string;
    planName: string;
    amountTzs: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const promises: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        })
      );
    }
    Promise.all(promises).then((dataUrls) => {
      setVImages((prev) => [...prev, ...dataUrls]);
      setUploadingImages(false);
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setVImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setVImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleAddCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures((prev) => [...prev, trimmed]);
      setCustomFeature("");
    }
  };

  const handleToggleService = (serviceTitle: string) => {
    setSelectedOptionalServices((prev) =>
      prev.includes(serviceTitle)
        ? prev.filter((s) => s !== serviceTitle)
        : [...prev, serviceTitle]
    );
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await createVehicleMutation({
        sellerId,
        title: vTitle.trim(),
        brand: vBrand,
        model: vModel.trim(),
        variant: vVariant.trim() || undefined,
        condition: vCondition,
        year: Number(vYear),
        mileage: Number(vMileage),
        fuelType: vFuel,
        transmission: vTransmission,
        engineCapacity: vEngine.trim() || undefined,
        priceTzs: Number(vPrice),
        location: vLocation,
        description: vDesc.trim(),
        features: selectedFeatures,
        optionalServices: selectedOptionalServices,
        images: vImages.length > 0 ? vImages : ["/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"],
      });

      setFormSuccess("Vehicle listing submitted! It is now pending admin approval before going live.");
      setVTitle("");
      setVModel("");
      setVDesc("");
      setTimeout(() => {
        setActiveTab("vehicles");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to create vehicle");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSetStatus = async (vehicleId: Id<"vehicles">, newStatus: string) => {
    if (!sellerId) return;
    try {
      await setVehicleStatusMutation({
        vehicleId,
        sellerId,
        status: newStatus,
      });
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const handleSendReply = async (enquiryId: Id<"enquiries">) => {
    if (!sellerId || !replyText.trim() || !user) return;
    try {
      await addEnquiryReplyMutation({
        enquiryId,
        senderId: sellerId,
        senderName: user.name,
        senderRole: "seller",
        message: replyText.trim(),
      });
      setReplyText("");
      setActiveEnquiryId(null);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  // Status donut data
  const statusPieData = [
    { name: "Active", value: stats?.activeCount || 12, color: "#10B981" },
    { name: "Pending Approval", value: stats?.pendingCount || 4, color: "#F59E0B" },
    { name: "Inactive", value: stats?.inactiveCount || 2, color: "#EF4444" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Left Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-900">
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="relative w-40 h-10 block">
              <Image
                src="/assets/aistudio/logo_52dfade8.png"
                alt="Swahivo"
                fill
                className="object-contain brightness-0 invert"
                sizes="160px"
              />
            </Link>
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
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("vehicles")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "vehicles"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4" />
                <span>My Vehicles</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {stats?.totalVehicles || 18}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("add_vehicle")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "add_vehicle"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                New
              </span>
            </button>

            <button
              onClick={() => setActiveTab("enquiries")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "enquiries"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Buyer Enquiries</span>
              </div>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                {enquiries?.length || 12}
              </span>
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
                <span>Orders & Bookings</span>
              </div>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                {orders?.length || 3}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("subscription")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "subscription"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4" />
                <span>My Subscription & Limits</span>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">
                {subscription?.planName || "Growth"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                activeTab === "profile"
                  ? "bg-red-600 text-white font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Dealership Profile</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Banner */}
        <div className="p-4 space-y-3">
          <div className="p-4 bg-gradient-to-br from-red-950/80 to-slate-900 rounded-2xl border border-red-800/40 text-left space-y-2">
            <span className="text-[10px] uppercase font-extrabold text-red-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Grow Your Sales
            </span>
            <p className="text-[11px] text-slate-300 leading-tight">
              Boost your listings to appear on the homepage and search spotlight.
            </p>
            <Link
              href="/pricing"
              className="inline-block w-full text-center py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-xl transition shadow-md"
            >
              Upgrade Plan
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Visit Public Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900">
                  Welcome back, {user?.name || "Ali Hassan"}
                </h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Dealer
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage your vehicles, enquiries, and subscription capacity with Swahivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("add_vehicle")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Vehicle</span>
            </button>

            <Link
              href={`/dealers/${dealerProfile?.slug || "swahivo-premier-motors"}`}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>View My Store</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => logout()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Account On-Hold Alert Banner */}
          {user?.status === "on_hold" && (
            <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-amber-950">
                      Seller Account Status: ON HOLD (Pending Payment & Admin Approval)
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-black uppercase tracking-wider">
                      Pending Activation
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Your dealer plan account is currently on hold. You can draft listings and manage settings now, but your vehicles and dealer storefront will only become publicly active once your payment reference is reviewed and approved by Swahivo admins.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("subscription")}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-sm"
              >
                View Invoices & Pay
              </button>
            </div>
          )}
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* 5 KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Total Vehicles</span>
                    <Car className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{stats?.totalVehicles || 18}</div>
                  <p className="text-[11px] text-slate-500">
                    <span className="text-emerald-600 font-bold">{stats?.activeCount || 12} Active</span> • {stats?.pendingCount || 4} Pending
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Total Enquiries</span>
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{stats?.totalEnquiries || 42}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+28% this month</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Orders / Bookings</span>
                    <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {(stats?.totalOrders || 0) + (stats?.totalBookings || 6)}
                  </div>
                  <span className="text-[11px] text-slate-500">3 Pending • 3 Completed</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 truncate">
                    {formatPrice(stats?.totalRevenueTzs || 48500000)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+35% growth</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500">Profile Views</span>
                    <Eye className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {(stats?.totalViews || 12480).toLocaleString("en-US")}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+18% this month</span>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enquiries & Orders Line Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Enquiries & Orders Trend</h3>
                      <p className="text-[11px] text-slate-400">Monthly conversion statistics</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-red-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Enquiries
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Orders
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.monthlyTrends || []}>
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Line type="monotone" dataKey="enquiries" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Vehicle Status Donut */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Vehicle Inventory Status</h3>
                    <p className="text-[11px] text-slate-400">Active vs Pending vs Inactive</p>
                  </div>

                  <div className="h-44 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-800">{stats?.totalVehicles || 18}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active Listings
                      </span>
                      <span className="font-bold">{stats?.activeCount || 12}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending Approval
                      </span>
                      <span className="font-bold">{stats?.pendingCount || 4}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Inactive / Sold
                      </span>
                      <span className="font-bold">{stats?.inactiveCount || 2}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    onClick={() => setActiveTab("add_vehicle")}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 border border-red-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Vehicle</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("vehicles")}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Car className="w-5 h-5 text-blue-600" />
                    <span>Manage Stock</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("enquiries")}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>View Enquiries</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("subscription")}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <span>My Plan & Limits</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    <span>Sales & Orders</span>
                  </button>
                </div>
              </div>

              {/* Recent Inventory Preview */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">My Vehicles</h3>
                  <button
                    onClick={() => setActiveTab("vehicles")}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    View All Stock ({stats?.totalVehicles || 18})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(vehicles?.slice(0, 4) || []).map((v) => (
                    <div
                      key={v._id}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col justify-between"
                    >
                      <div className="relative aspect-16/10 bg-slate-200">
                        <Image
                          src={v.primaryImage || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"}
                          alt={v.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                        <span
                          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            v.status === "active"
                              ? "bg-emerald-600 text-white"
                              : v.status === "pending_approval"
                              ? "bg-amber-500 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {v.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{v.title}</h4>
                        <p className="text-sm font-extrabold text-red-600">{formatPrice(v.priceTzs)}</p>
                        <div className="text-[11px] text-slate-500 flex justify-between">
                          <span>{v.year}</span>
                          <span>{v.mileage.toLocaleString("en-US")} km</span>
                          <span>{v.location}</span>
                        </div>
                        <div className="pt-2 flex gap-2">
                          <Link
                            href={`/cars/${v.slug}`}
                            className="flex-1 text-center py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[11px] font-bold"
                          >
                            View
                          </Link>
                          <button
                            onClick={() =>
                              handleSetStatus(v._id, v.status === "active" ? "inactive" : "active")
                            }
                            className="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold"
                          >
                            {v.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MY VEHICLES */}
          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
                  <p className="text-xs text-slate-500">
                    Capacity usage: <strong>{subscription?.currentActiveListings || 0}</strong> active /{" "}
                    <strong>{subscription?.listingLimit || 30}</strong> allowed on {subscription?.planName || "Free"} tier.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("add_vehicle")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-2">
                {(["all", "active", "pending_approval", "inactive"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setVehicleFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      vehicleFilter === st
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(vehicles || []).map((v) => (
                  <div key={v._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="relative aspect-16/10 bg-slate-900">
                      <Image
                        src={v.primaryImage || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"}
                        alt={v.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <span
                        className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          v.status === "active"
                            ? "bg-emerald-600 text-white"
                            : v.status === "pending_approval"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {v.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{v.title}</h3>
                        <p className="text-base font-extrabold text-red-600 mt-0.5">{formatPrice(v.priceTzs)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>Year: <strong>{v.year}</strong></span>
                        <span>Mileage: <strong>{v.mileage.toLocaleString("en-US")} km</strong></span>
                        <span>Fuel: <strong>{v.fuelType}</strong></span>
                        <span>City: <strong>{v.location}</strong></span>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href={`/cars/${v.slug}`}
                          className="flex-1 text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                        >
                          View Public
                        </Link>
                        <button
                          onClick={() =>
                            handleSetStatus(v._id, v.status === "active" ? "inactive" : "active")
                          }
                          className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200"
                        >
                          {v.status === "active" ? "Mark Inactive" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD VEHICLE FORM (WITH CAPACITY ENFORCEMENT) */}
          {activeTab === "add_vehicle" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New Vehicle Listing</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Listings are transactionally checked against your {subscription?.planName || "Free"} tier capacity
                  ({subscription?.currentActiveListings || 0}/{subscription?.listingLimit || 1} currently active).
                </p>
              </div>

              {formError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Cannot Create Listing</p>
                    <p>{formError}</p>
                    <button
                      onClick={() => setActiveTab("subscription")}
                      className="mt-2 text-xs font-bold underline"
                    >
                      Upgrade your subscription plan to unlock more listings &rarr;
                    </button>
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateVehicle} className="space-y-6">
                {/* 1. Vehicle Photos Upload Section */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-900">
                        Vehicle Photos & Gallery ({vImages.length} attached)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Upload real photos from your phone or device. The first image will be used as the primary cover photo.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="vehicle-photo-upload"
                        className="cursor-pointer px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImages ? "Uploading..." : "Upload Photos"}</span>
                      </label>
                      <input
                        id="vehicle-photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Or Add by Image URL */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste an image web link (https://...)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Image Thumbnails Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {vImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-200 group"
                      >
                        <Image
                          src={img}
                          alt={`Uploaded vehicle ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-red-600 text-white rounded-md opacity-80 group-hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Basic Specs */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Listing Title</label>
                  <input
                    type="text"
                    required
                    value={vTitle}
                    onChange={(e) => setVTitle(e.target.value)}
                    placeholder="e.g. 2023 Toyota Land Cruiser 300 VXR V6"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Make</label>
                    <select
                      value={vBrand}
                      onChange={(e) => setVBrand(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Ford">Ford</option>
                      <option value="Honda">Honda</option>
                      <option value="Land Rover">Land Rover</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Lexus">Lexus</option>
                      <option value="Subaru">Subaru</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Audi">Audi</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Suzuki">Suzuki</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
                    <input
                      type="text"
                      required
                      value={vModel}
                      onChange={(e) => setVModel(e.target.value)}
                      placeholder="e.g. Land Cruiser"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Variant / Trim</label>
                    <input
                      type="text"
                      value={vVariant}
                      onChange={(e) => setVVariant(e.target.value)}
                      placeholder="e.g. 300 VXR / TX-L"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                    <select
                      value={vCondition}
                      onChange={(e) => setVCondition(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="New">Brand New</option>
                      <option value="Used">Used</option>
                      <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                    <input
                      type="number"
                      required
                      value={vYear}
                      onChange={(e) => setVYear(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mileage (km)</label>
                    <input
                      type="number"
                      required
                      value={vMileage}
                      onChange={(e) => setVMileage(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <select
                      value={vLocation}
                      onChange={(e) => setVLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Dar es Salaam">Dar es Salaam</option>
                      <option value="Zanzibar">Zanzibar</option>
                      <option value="Arusha">Arusha</option>
                      <option value="Mwanza">Mwanza</option>
                      <option value="Dodoma">Dodoma</option>
                      <option value="Mbeya">Mbeya</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Type</label>
                    <select
                      value={vFuel}
                      onChange={(e) => setVFuel(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Transmission</label>
                    <select
                      value={vTransmission}
                      onChange={(e) => setVTransmission(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (TZS)</label>
                    <input
                      type="number"
                      required
                      value={vPrice}
                      onChange={(e) => setVPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold text-red-600 bg-white"
                    />
                  </div>
                </div>

                {/* 3. Rich Equipment & Key Features (Item 9) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Equipment & Key Features ({selectedFeatures.length} selected)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Select features to highlight on your vehicle listing across safety, interior comfort, tech, and TRA compliance.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {FEATURE_CATEGORIES.map((catGroup) => (
                      <div key={catGroup.category} className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          {catGroup.category}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {catGroup.items.map((item) => {
                            const isSelected = selectedFeatures.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => handleToggleFeature(item)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 border ${
                                  isSelected
                                    ? "bg-red-600 text-white border-red-600 font-semibold shadow-xs"
                                    : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3 h-3 text-white" />
                                ) : (
                                  <Plus className="w-3 h-3 text-slate-400" />
                                )}
                                <span>{item}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Feature */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="text"
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      placeholder="Add custom feature (e.g. Snorkel, BF Goodrich All-Terrain Tires)..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeature}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      Add Custom
                    </button>
                  </div>
                </div>

                {/* 4. Optional Value-Added Services (Item 4) */}
                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200/70 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-red-700">
                      <ShieldCheck className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Dealer Value-Added Services (Optional for Buyer)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Check any optional Swahivo verified services you want to make available for buyers booking this vehicle.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {OPTIONAL_SERVICES_DATA.map((srv) => {
                      const isChecked = selectedOptionalServices.includes(srv.title);
                      return (
                        <label
                          key={srv.id}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                            isChecked
                              ? "bg-white border-red-500 shadow-xs ring-1 ring-red-500"
                              : "bg-white/80 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleService(srv.title)}
                            className="mt-0.5 h-4 w-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">{srv.title}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-800 rounded shrink-0">
                                {srv.price}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">{srv.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={vDesc}
                    onChange={(e) => setVDesc(e.target.value)}
                    placeholder="Provide full details regarding TRA documentation, vehicle maintenance, service history, inspection warranty..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{formLoading ? "Validating & Submitting..." : "Submit Vehicle for Approval"}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ENQUIRIES & MESSAGING */}
          {activeTab === "enquiries" && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Buyer Enquiries & Leads</h2>
                <p className="text-xs text-slate-500">Real-time enquiries received from buyers across Tanzania.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {(enquiries || []).map((enq) => (
                  <div key={enq._id} className="py-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{enq.buyerName}</h4>
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
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Interested in: <strong className="text-slate-800">{enq.vehicleTitle}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                        {new Date(enq.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                      &ldquo;{enq.message}&rdquo;
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Phone: <strong className="text-slate-800">{enq.buyerPhone}</strong></span>
                      <span>Email: <strong className="text-slate-800">{enq.buyerEmail}</strong></span>
                    </div>

                    {/* Reply box */}
                    {activeEnquiryId === enq._id ? (
                      <div className="pt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your response to the buyer..."
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                        <button
                          onClick={() => handleSendReply(enq._id)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => setActiveEnquiryId(null)}
                          className="px-2 py-1.5 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveEnquiryId(enq._id);
                          setReplyText("");
                        }}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        + Write Reply Message
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & BOOKINGS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Vehicle Orders & Reservations</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Amount (TZS)</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(orders || []).map((ord) => (
                        <tr key={ord._id}>
                          <td className="py-3 px-3 font-bold text-slate-900">{ord.orderNumber}</td>
                          <td className="py-3 px-3">{ord.customerName}</td>
                          <td className="py-3 px-3 font-semibold">{ord.vehicleTitle}</td>
                          <td className="py-3 px-3 font-bold text-red-600">{formatPrice(ord.amountTzs)}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                ord.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{ord.dateStr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bookings */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Scheduled Test Drives & Inspections</h2>
                <div className="divide-y divide-slate-100">
                  {(bookings || []).map((bk) => (
                    <div key={bk._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{bk.buyerName} — {bk.bookingType.replace("_", " ")}</p>
                        <p className="text-slate-500">{bk.vehicleTitle} • {bk.scheduledDate} at {bk.scheduledTime}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-1 rounded text-slate-700 uppercase">
                        {bk.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUBSCRIPTION & BILLING */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Current Subscription Plan</h2>
                    <p className="text-xs text-slate-500">Manage listing limits, invoices, and payment receipts.</p>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                  >
                    Change / Upgrade Plan
                  </Link>
                </div>

                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400">
                      Active SaaS Package
                    </span>
                    <h3 className="text-2xl font-black mt-1">{subscription?.planName || "Growth"} Tier</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Active Listing Limit: <strong>{subscription?.listingLimit || 30} vehicles</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Usage</span>
                    <p className="text-2xl font-black text-emerald-400">
                      {subscription?.currentActiveListings || 0} / {subscription?.listingLimit || 30}
                    </p>
                    <span className="text-xs text-slate-400">Active Listings</span>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">Subscription Invoices</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <th className="py-2 px-3">Invoice #</th>
                        <th className="py-2 px-3">Plan</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Payment Ref</th>
                        <th className="py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(invoices || []).map((inv) => (
                        <tr key={inv._id}>
                          <td className="py-3 px-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="py-3 px-3">{inv.planName}</td>
                          <td className="py-3 px-3 font-bold text-red-600">{formatPrice(inv.amountTzs)}</td>
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
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                            {inv.paymentReference || "—"}
                          </td>
                          <td className="py-3 px-3">
                            {inv.status === "pending" && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice({
                                    invoiceId: inv._id,
                                    invoiceNumber: inv.invoiceNumber,
                                    planName: inv.planName,
                                    amountTzs: inv.amountTzs,
                                  });
                                  setPayModalOpen(true);
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                              >
                                Pay / Submit Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Dealership Showroom Profile</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-500">Business Name:</span>
                  <p className="font-bold text-slate-800 text-sm">
                    {dealerProfile?.businessName || "Swahivo Premier Motors"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Physical Address:</span>
                  <p className="text-slate-700">
                    {dealerProfile?.address || "Plot 42, Airport Road, Kiembe Samaki, Zanzibar & Dar es Salaam"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Phone:</span>
                  <p className="text-slate-700">{dealerProfile?.phone || "+255 674 766 586"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Email:</span>
                  <p className="text-slate-700">{dealerProfile?.email || "hello@swahivo.com"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Description:</span>
                  <p className="text-slate-700 leading-relaxed mt-1">
                    {dealerProfile?.description ||
                      "Official authorized multi-brand car dealership with direct Japanese, European and UAE vehicle imports, full TRA registration, warranty and financing options."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {selectedInvoice && (
        <PaymentModal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          invoiceId={selectedInvoice.invoiceId}
          invoiceNumber={selectedInvoice.invoiceNumber}
          planName={selectedInvoice.planName}
          amountTzs={selectedInvoice.amountTzs}
        />
      )}
    </div>
  );
}
