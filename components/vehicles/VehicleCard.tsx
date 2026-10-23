"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Heart, Calendar, Gauge, Fuel, Cog, MapPin, MessageCircle, Eye } from "lucide-react";
import { EnquiryModal } from "@/components/modals/EnquiryModal";

export interface VehicleProps {
  _id: Id<"vehicles">;
  title: string;
  slug: string;
  brand: string;
  model: string;
  condition: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  priceTzs: number;
  location: string;
  primaryImage: string;
  isFeatured?: boolean;
  viewCount?: number;
}

export function VehicleCard({ vehicle }: { vehicle: VehicleProps }) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  // Check if favorited
  const isFav = useQuery(
    api.favorites.isFavorited,
    user?.userId ? { userId: user.userId, vehicleId: vehicle._id } : "skip"
  );
  const toggleFavMutation = useMutation(api.favorites.toggleFavorite);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please sign in to save vehicles to your favorites.");
      return;
    }
    await toggleFavMutation({ userId: user.userId, vehicleId: vehicle._id });
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Swahivo, I am interested in the ${vehicle.title} (${vehicle.year}) listed for ${formatPrice(vehicle.priceTzs)}. Is it available?`
  );

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-red-500/50 hover:shadow-xl transition-all duration-300 flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
          <Link href={`/cars/${vehicle.slug}`}>
            <Image
              src={vehicle.primaryImage || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"}
              alt={vehicle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {vehicle.isFeatured && (
              <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md tracking-wide uppercase">
                Featured
              </span>
            )}
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {vehicle.condition}
            </span>
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition z-10 shadow-md ${
              isFav
                ? "bg-red-600 text-white"
                : "bg-white/80 hover:bg-white text-slate-700 hover:text-red-600"
            }`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <Link href={`/cars/${vehicle.slug}`}>
              <h3 className="text-base font-bold text-slate-900 hover:text-red-600 transition line-clamp-1">
                {vehicle.title}
              </h3>
            </Link>

            {/* Price */}
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-extrabold text-red-600">
                {formatPrice(vehicle.priceTzs)}
              </span>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 py-2.5 border-y border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.mileage.toLocaleString("en-US")} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cog className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              {vehicle.location}
            </span>
            {vehicle.viewCount !== undefined && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Eye className="w-3 h-3" />
                {vehicle.viewCount} views
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              href={`/cars/${vehicle.slug}`}
              className="flex-1 text-center py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
            >
              View Details
            </Link>

            <a
              href={`https://wa.me/255770565656?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-200"
              title="Quick WhatsApp Enquiry"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        vehicleId={vehicle._id}
        vehicleTitle={vehicle.title}
      />
    </>
  );
}
