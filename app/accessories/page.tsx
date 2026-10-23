"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrency } from "@/components/providers/ConvexClientProvider";
import { Wrench, ShoppingCart, Check, Phone } from "lucide-react";

export default function AccessoriesPage() {
  const { formatPrice } = useCurrency();
  const [selectedCat, setSelectedCat] = useState("All");

  const accessories = [
    {
      title: "Toyota Prado & LC300 Alloy Rim Set (20 inch)",
      category: "Wheels & Tires",
      priceTzs: 3800000,
      condition: "New",
      stock: 4,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      seller: "Swahivo Parts Kiembe Samaki",
    },
    {
      title: "Android Auto & Apple CarPlay 10.2' Touchscreen Head Unit",
      category: "Electronics",
      priceTzs: 650000,
      condition: "New",
      stock: 12,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      seller: "Zanzibar Auto Electronics",
    },
    {
      title: "Heavy Duty 4x4 Offroad Winch (12,000 lbs)",
      category: "Off-Road",
      priceTzs: 1950000,
      condition: "New",
      stock: 3,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      seller: "Safari Gear Dar es Salaam",
    },
    {
      title: "Custom Waterproof 7D Car Floor Mats (All SUV models)",
      category: "Interior",
      priceTzs: 280000,
      condition: "New",
      stock: 25,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      seller: "Auto Comfort TZ",
    },
    {
      title: "Original Bosch AGM High-Capacity Car Battery 12V 80Ah",
      category: "Maintenance",
      priceTzs: 480000,
      condition: "New",
      stock: 8,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      seller: "Dar Battery Centre",
    },
    {
      title: "LED Projector Fog Lights Dual-Color (White/Amber)",
      category: "Lighting",
      priceTzs: 160000,
      condition: "New",
      stock: 15,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      seller: "Swahivo Parts",
    },
  ];

  const filtered = selectedCat === "All" ? accessories : accessories.filter((a) => a.category === selectedCat);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            PARTS & ACCESSORIES
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Genuine Auto Parts & Car Accessories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            Browse genuine spare parts, offroad equipment, Android stereos, and accessories with doorstep delivery across Tanzania.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Wheels & Tires", "Electronics", "Off-Road", "Interior", "Maintenance", "Lighting"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat ? "bg-red-600 text-white" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-100">
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.condition}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h3>
                  <p className="text-base font-extrabold text-red-600 mt-1">{formatPrice(item.priceTzs)}</p>
                </div>
                <p className="text-[11px] text-slate-500">Seller: <strong>{item.seller}</strong></p>
              </div>

              <a
                href={`https://wa.me/255770565656?text=${encodeURIComponent(`Hello Swahivo, I want to order ${item.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
