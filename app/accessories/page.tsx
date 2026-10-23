"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import {
  Wrench,
  ShoppingCart,
  Check,
  Phone,
  Plus,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function AccessoriesPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [selectedCat, setSelectedCat] = useState("All");

  // Fetch accessories from database
  const dbAccessories = useQuery(api.meta.listAccessories, {
    category: selectedCat === "All" ? undefined : selectedCat,
  });

  const createAccessoryMutation = useMutation(api.meta.createAccessory);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wheels & Tires");
  const [priceTzs, setPriceTzs] = useState(250000);
  const [condition, setCondition] = useState("New");
  const [stock, setStock] = useState(5);
  const [sellerName, setSellerName] = useState(user?.name ? `${user.name} Auto` : "Swahivo Parts");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

interface AccessoryItem {
  _id: string;
  title: string;
  category: string;
  priceTzs: number;
  condition: string;
  stock: number;
  image?: string;
  sellerName?: string;
  description?: string;
}

  // Fallback seed accessories
  const defaultAccessories: AccessoryItem[] = [
    {
      _id: "default-1",
      title: "Toyota Prado & LC300 Alloy Rim Set (20 inch)",
      category: "Wheels & Tires",
      priceTzs: 3800000,
      condition: "New",
      stock: 4,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      sellerName: "Swahivo Parts Kiembe Samaki",
    },
    {
      _id: "default-2",
      title: "Android Auto & Apple CarPlay 10.2' Touchscreen Head Unit",
      category: "Electronics",
      priceTzs: 650000,
      condition: "New",
      stock: 12,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      sellerName: "Zanzibar Auto Electronics",
    },
    {
      _id: "default-3",
      title: "Heavy Duty 4x4 Offroad Winch (12,000 lbs)",
      category: "Off-Road",
      priceTzs: 1950000,
      condition: "New",
      stock: 3,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      sellerName: "Safari Gear Dar es Salaam",
    },
    {
      _id: "default-4",
      title: "Custom Waterproof 7D Car Floor Mats (All SUV models)",
      category: "Interior",
      priceTzs: 280000,
      condition: "New",
      stock: 25,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      sellerName: "Auto Comfort TZ",
    },
    {
      _id: "default-5",
      title: "Original Bosch AGM High-Capacity Car Battery 12V 80Ah",
      category: "Maintenance",
      priceTzs: 480000,
      condition: "New",
      stock: 8,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      sellerName: "Dar Battery Centre",
    },
    {
      _id: "default-6",
      title: "LED Projector Fog Lights Dual-Color (White/Amber)",
      category: "Lighting",
      priceTzs: 160000,
      condition: "New",
      stock: 15,
      image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      sellerName: "Swahivo Parts",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAccessory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await createAccessoryMutation({
        title: title.trim(),
        category,
        priceTzs: Number(priceTzs),
        condition,
        stock: Number(stock),
        sellerId: user?.userId,
        sellerName: sellerName.trim() || (user?.name ? `${user.name} Auto` : "Swahivo Verified Dealer"),
        description: description.trim() || "Genuine car parts and automotive accessories with nationwide warranty.",
        image: imageUrl || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
      });

      setFormSuccess("Accessory uploaded and published successfully!");
      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess(null);
        setTitle("");
        setDescription("");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to upload accessory.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Combine DB accessories with default fallbacks
  const displayedAccessories: AccessoryItem[] =
    dbAccessories && dbAccessories.length > 0
      ? [
          ...dbAccessories.map((item) => ({
            ...item,
            sellerName: (item as { sellerName?: string }).sellerName || "Swahivo Verified Dealer",
          })),
          ...defaultAccessories.filter(
            (def) => selectedCat === "All" || def.category === selectedCat
          ),
        ]
      : defaultAccessories.filter(
          (def) => selectedCat === "All" || def.category === selectedCat
        );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              PARTS & ACCESSORIES
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Genuine Auto Parts & Car Accessories
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
              Browse genuine spare parts, offroad equipment, Android stereos, and accessories with doorstep delivery across Tanzania & Zanzibar.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Accessory</span>
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Wheels & Tires", "Electronics", "Off-Road", "Interior", "Maintenance", "Lighting"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === cat
                  ? "bg-red-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAccessories.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-4 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-100">
                  <Image
                    src={item.image || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.condition}
                  </span>
                  <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.stock} In Stock
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-2">{item.title}</h3>
                  <p className="text-base font-extrabold text-red-600 mt-1">{formatPrice(item.priceTzs)}</p>
                </div>
                <p className="text-[11px] text-slate-500">
                  Seller: <strong>{item.sellerName || "Swahivo Verified Dealer"}</strong>
                </p>
              </div>

              <a
                href={`https://wa.me/255674766586?text=${encodeURIComponent(
                  `Hello Swahivo Company, I want to order the accessory: ${item.title} (${formatPrice(item.priceTzs)})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Order via WhatsApp (+255 674 766 586)</span>
              </a>
            </div>
          ))}
        </div>
      </main>

      {/* Upload Accessory Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">Upload Car Accessory</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccessory} className="space-y-4">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Accessory Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={imageUrl || "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png"}
                      alt="Accessory preview"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label
                      htmlFor="accessory-file-input"
                      className="cursor-pointer px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                    </label>
                    <input
                      id="accessory-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-[11px] text-slate-400">JPG, PNG or WebP from your device.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accessory Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 20-inch Alloy Rims / Touchscreen Stereo"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Wheels & Tires">Wheels & Tires</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Off-Road">Off-Road</option>
                    <option value="Interior">Interior</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="New">Brand New</option>
                    <option value="Used">Used / Grade A</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (TZS)</label>
                  <input
                    type="number"
                    required
                    value={priceTzs}
                    onChange={(e) => setPriceTzs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Seller Name</label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Swahivo Parts Zanzibar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details about fitment, warranty, compatibility..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploadingImage}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm"
                >
                  {formLoading ? "Publishing..." : "Publish Accessory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
