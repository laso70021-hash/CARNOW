"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Filter, X } from "lucide-react";

interface FilterBarProps {
  onSearch: (filters: {
    brand?: string;
    condition?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
  }) => void;
}

export function VehicleFilterBar({ onSearch }: FilterBarProps) {
  const [carType, setCarType] = useState("All Types");
  const [make, setMake] = useState("All Makes");
  const [priceRange, setPriceRange] = useState("Any Price");
  const [location, setLocation] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let minPrice: number | undefined = undefined;
    let maxPrice: number | undefined = undefined;

    if (priceRange === "Under 30M") {
      maxPrice = 30000000;
    } else if (priceRange === "30M - 50M") {
      minPrice = 30000000;
      maxPrice = 50000000;
    } else if (priceRange === "50M - 80M") {
      minPrice = 50000000;
      maxPrice = 80000000;
    } else if (priceRange === "Above 80M") {
      minPrice = 80000000;
    }

    onSearch({
      condition: carType !== "All Types" ? carType : undefined,
      brand: make !== "All Makes" ? make : undefined,
      location: location !== "All Locations" ? location : undefined,
      minPrice,
      maxPrice,
      searchQuery: searchQuery.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-200/90 max-w-5xl mx-auto -mt-8 relative z-30">
      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        {/* Car Condition / Type */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Condition
          </label>
          <div className="relative">
            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer appearance-none"
            >
              <option value="All Types">All Conditions</option>
              <option value="New">Brand New</option>
              <option value="Used">Used / Pre-Owned</option>
              <option value="Certified Pre-Owned">Certified Pre-Owned</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Make / Brand */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Make / Brand
          </label>
          <div className="relative">
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer appearance-none"
            >
              <option value="All Makes">All Makes</option>
              <option value="Toyota">Toyota</option>
              <option value="BMW">BMW</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="Ford">Ford</option>
              <option value="Honda">Honda</option>
              <option value="Land Rover">Land Rover</option>
              <option value="Nissan">Nissan</option>
              <option value="Mitsubishi">Mitsubishi</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Price Range
          </label>
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer appearance-none"
            >
              <option value="Any Price">Any Price</option>
              <option value="Under 30M">Under TZS 30,000,000</option>
              <option value="30M - 50M">TZS 30M - 50,000,000</option>
              <option value="50M - 80M">TZS 50M - 80,000,000</option>
              <option value="Above 80M">Above TZS 80,000,000</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Location
          </label>
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer appearance-none"
            >
              <option value="All Locations">All Locations</option>
              <option value="Dar es Salaam">Dar es Salaam</option>
              <option value="Zanzibar">Zanzibar</option>
              <option value="Arusha">Arusha</option>
              <option value="Mwanza">Mwanza</option>
              <option value="Dodoma">Dodoma</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Search className="w-4 h-4" />
            <span>Search Cars</span>
          </button>
        </div>
      </form>
    </div>
  );
}
