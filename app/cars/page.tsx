"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { useCurrency } from "@/components/providers/ConvexClientProvider";
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Car } from "lucide-react";

export default function CarsMarketplacePage() {
  const { formatPrice } = useCurrency();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [condition, setCondition] = useState("All");
  const [location, setLocation] = useState("All");
  const [fuelType, setFuelType] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);

  const vehicles = useQuery(api.vehicles.listPublicVehicles, {
    searchQuery: searchQuery.trim() || undefined,
    brand: brand !== "All" ? brand : undefined,
    condition: condition !== "All" ? condition : undefined,
    location: location !== "All" ? location : undefined,
    fuelType: fuelType !== "All" ? fuelType : undefined,
    transmission: transmission !== "All" ? transmission : undefined,
    maxPrice: priceMax,
    sortBy,
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setBrand("All");
    setCondition("All");
    setLocation("All");
    setFuelType("All");
    setTransmission("All");
    setPriceMax(undefined);
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Title */}
        <div className="mb-6 space-y-1">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Marketplace</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Vehicles Available in Tanzania & Zanzibar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse verified listings from certified auto dealerships. All cars include inspection documents and title verification.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Toyota Land Cruiser, BMW, Arusha..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {vehicles ? `${vehicles.length} listings found` : "Loading..."}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="mileage">Lowest Mileage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid with Sidebar Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                Filter Vehicles
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-red-600 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Make</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              >
                <option value="All">All Brands</option>
                <option value="Toyota">Toyota</option>
                <option value="BMW">BMW</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Ford">Ford</option>
                <option value="Honda">Honda</option>
                <option value="Land Rover">Land Rover</option>
                <option value="Nissan">Nissan</option>
                <option value="Mitsubishi">Mitsubishi</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Condition</label>
              <div className="space-y-1.5">
                {["All", "New", "Used", "Certified Pre-Owned"].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="condition_filter"
                      checked={condition === c}
                      onChange={() => setCondition(c)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>{c === "All" ? "All Conditions" : c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              >
                <option value="All">All Tanzania & Zanzibar</option>
                <option value="Dar es Salaam">Dar es Salaam</option>
                <option value="Zanzibar">Zanzibar</option>
                <option value="Arusha">Arusha</option>
                <option value="Mwanza">Mwanza</option>
                <option value="Dodoma">Dodoma</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              >
                <option value="All">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              >
                <option value="All">All Transmissions</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Max Price quick selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Price (TZS)</label>
              <div className="space-y-1.5">
                {[
                  { label: "Any Price", val: undefined },
                  { label: "Under TZS 30,000,000", val: 30000000 },
                  { label: "Under TZS 50,000,000", val: 50000000 },
                  { label: "Under TZS 80,000,000", val: 80000000 },
                ].map((p, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="price_filter"
                      checked={priceMax === p.val}
                      onChange={() => setPriceMax(p.val)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle List Grid */}
          <div className="lg:col-span-3">
            {vehicles === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No matching vehicles found</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your filters or search keywords to view other listings.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((v) => (
                  <VehicleCard key={v._id} vehicle={v} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
