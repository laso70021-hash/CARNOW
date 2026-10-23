"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import {
  Calendar,
  Gauge,
  Fuel,
  Cog,
  MapPin,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Clock,
  Car,
  ChevronRight,
  CreditCard,
  Send,
  Building,
} from "lucide-react";
import { EnquiryModal } from "@/components/modals/EnquiryModal";
import { BookingModal } from "@/components/modals/BookingModal";
import { FinancingModal } from "@/components/modals/FinancingModal";

export default function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const vehicle = useQuery(api.vehicles.getVehicleBySlug, { slug });

  // Modals
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [financingOpen, setFinancingOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Favorites
  const isFav = useQuery(
    api.favorites.isFavorited,
    user?.userId && vehicle ? { userId: user.userId, vehicleId: vehicle._id } : "skip"
  );
  const toggleFav = useMutation(api.favorites.toggleFavorite);
  const createOrderMutation = useMutation(api.orders.createOrder);

  if (vehicle === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading vehicle specifications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-4 max-w-md">
            <Car className="w-16 h-16 text-slate-300 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Vehicle Not Found</h2>
            <p className="text-xs text-slate-500">
              The requested vehicle may have been sold or removed by the seller.
            </p>
            <Link
              href="/cars"
              className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : [vehicle.primaryImage || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"];

  const handleOrder = async () => {
    if (!user) {
      alert("Please sign in or register to reserve this vehicle.");
      return;
    }
    const res = await createOrderMutation({
      vehicleId: vehicle._id,
      buyerId: user.userId,
      customerName: user.name,
      customerPhone: user.phone || "+255 770 000 000",
      customerEmail: user.email,
      deliveryLocation: vehicle.location,
      paymentMethod: "Bank / Showroom Escrow",
    });
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 4000);
  };

  const whatsappLink = `https://wa.me/255674766586?text=${encodeURIComponent(
    `Hello Swahivo, I want to inspect/buy the ${vehicle.title} (${vehicle.year}) listed for ${formatPrice(vehicle.priceTzs)}. Reference slug: ${slug}`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cars" className="hover:text-red-600">
            Cars
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium truncate max-w-xs">{vehicle.title}</span>
        </div>

        {orderPlaced && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Vehicle reservation initiated! Your order has been registered in the system. The dealer showroom has been alerted to hold the car for inspection.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-900">
                <Image
                  src={allImages[activeImageIndex] || allImages[0]}
                  alt={vehicle.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />

                {vehicle.isFeatured && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Featured
                  </span>
                )}

                <button
                  onClick={async () => {
                    if (!user) {
                      alert("Please log in to save vehicles to your favorites.");
                      return;
                    }
                    await toggleFav({ userId: user.userId, vehicleId: vehicle._id });
                  }}
                  className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg backdrop-blur-md transition ${
                    isFav ? "bg-red-600 text-white" : "bg-white/80 hover:bg-white text-slate-700 hover:text-red-600"
                  }`}
                  title="Favorite"
                >
                  <Heart className={`w-5 h-5 ${isFav ? "fill-white" : ""}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        activeImageIndex === idx ? "border-red-600" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt="Thumbnail" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Overview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full uppercase">
                      {vehicle.condition}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {vehicle.location}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{vehicle.title}</h1>
                  {vehicle.variant && <p className="text-xs text-slate-500 mt-1">{vehicle.variant}</p>}
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-semibold text-slate-500">Asking Price</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-red-600">
                    {formatPrice(vehicle.priceTzs)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Negotiable / TRA taxes paid</span>
                </div>
              </div>

              {/* Key Specifications Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                  Vehicle Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Year</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {vehicle.year}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Mileage</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      {vehicle.mileage.toLocaleString("en-US")} km
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Fuel Type</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Fuel className="w-4 h-4 text-slate-400" />
                      {vehicle.fuelType}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium">Transmission</span>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Cog className="w-4 h-4 text-slate-400" />
                      {vehicle.transmission}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
                  Vehicle Description & History
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>

              {/* Features List */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                    Equipment & Key Features
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {vehicle.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 font-medium border border-slate-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Value-Added Services */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                    OPTIONAL DEALER SERVICES
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    Add-On Automotive Ownership Services
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optionally available with this vehicle from Swahivo Company and verified partners.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">TRA Registration & Title Transfer</h4>
                        <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          From TZS 250,000
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Fast, stress-free vehicle registration, logbook transfer, custom duty clearance, and number plate issuance across Tanzania and Zanzibar.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/255674766586?text=${encodeURIComponent(`Hello Swahivo, I want to book TRA Registration & Title Transfer Service for ${vehicle.title} (${slug})`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Book Service Now</span>
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">Pre-Purchase Inspection (150 Pts)</h4>
                        <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          TZS 180,000
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Detailed mechanical, computerized OBD diagnostic, structural chassis, engine compression, and paint thickness evaluation by certified engineers.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/255674766586?text=${encodeURIComponent(`Hello Swahivo, I want to book Comprehensive Pre-Purchase Inspection (150 Points) for ${vehicle.title} (${slug})`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Book Service Now</span>
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">Inter-City Carrier & Shipping</h4>
                        <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          From TZS 450,000
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Insured vehicle transport between Dar es Salaam, Zanzibar ports, Arusha, Mwanza, Dodoma, and Mbeya on hydraulic flatbed trailers.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/255674766586?text=${encodeURIComponent(`Hello Swahivo, I want to book Inter-City Vehicle Carrier & Shipping for ${vehicle.title} (${slug})`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Book Service Now</span>
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">Scheduled Minor & Major Service</h4>
                        <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          From TZS 150,000
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Synthetic engine oil replacement, genuine oil filter, spark plugs, brake pads check, air filters, and suspension greasing.
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/255674766586?text=${encodeURIComponent(`Hello Swahivo, I want to book Scheduled Maintenance & Service for ${vehicle.title} (${slug})`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Book Service Now</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Dealership Profile */}
          <div className="space-y-6">
            {/* Quick Action Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact & Purchase</h3>

              {/* WhatsApp Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Direct Enquiry Modal Trigger */}
              <button
                onClick={() => setEnquiryOpen(true)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-red-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Send Vehicle Enquiry</span>
              </button>

              {/* Book Test Drive */}
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200"
              >
                <Calendar className="w-4 h-4 text-slate-600" />
                <span>Book Test Drive / Inspection</span>
              </button>

              {/* Apply for Financing */}
              <button
                onClick={() => setFinancingOpen(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200"
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Calculate & Apply for Financing</span>
              </button>

              {/* Instant Order / Reservation */}
              <button
                onClick={handleOrder}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reserve Vehicle Now</span>
              </button>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Swahivo Buyer Protection
                </span>
                <span>TRA Verified</span>
              </div>
            </div>

            {/* Dealership Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Authorized Dealer
              </span>

              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {vehicle.dealership?.businessName || "Swahivo Premier Motors"}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-amber-500">★ 4.9</span>
                    <span className="text-[11px] text-slate-400">• Verified Dealership</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {vehicle.dealership?.location || "Kiembe Samaki, Zanzibar & Dar es Salaam"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${vehicle.sellerPhone}`} className="hover:text-red-600 font-semibold">
                    {vehicle.sellerPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{vehicle.sellerEmail}</span>
                </div>
              </div>

              <Link
                href="/dealers"
                className="block text-center py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 rounded-xl"
              >
                View Dealer Showroom & Stock
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        vehicleId={vehicle._id}
        vehicleTitle={vehicle.title}
      />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        vehicleId={vehicle._id}
        vehicleTitle={vehicle.title}
      />

      <FinancingModal
        isOpen={financingOpen}
        onClose={() => setFinancingOpen(false)}
        vehicleId={vehicle._id}
        vehicleTitle={vehicle.title}
        vehiclePriceTzs={vehicle.priceTzs}
      />
    </div>
  );
}
