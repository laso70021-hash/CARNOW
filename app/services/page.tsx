"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCurrency } from "@/components/providers/ConvexClientProvider";
import { Wrench, ShieldCheck, FileText, Truck, Phone, CheckCircle2 } from "lucide-react";

export default function ServicesPage() {
  const { formatPrice } = useCurrency();

  const services = [
    {
      title: "TRA Registration & Title Transfer Service",
      desc: "Fast, stress-free vehicle registration, logbook transfer, custom duty clearance, and number plate issuance across Tanzania and Zanzibar.",
      price: "From TZS 250,000",
      icon: FileText,
      phone: "+255 674 766 586",
    },
    {
      title: "Comprehensive Pre-Purchase Inspection (150 Points)",
      desc: "Detailed mechanical, computerized OBD diagnostic, structural chassis, engine compression, and paint thickness evaluation by certified engineers.",
      price: "TZS 180,000",
      icon: ShieldCheck,
      phone: "+255 674 766 586",
    },
    {
      title: "Inter-City Vehicle Carrier & Shipping (Dar to Zanzibar)",
      desc: "Insured vehicle transport between Dar es Salaam, Zanzibar ports, Arusha, Mwanza, Dodoma, and Mbeya on hydraulic flatbed trailers.",
      price: "From TZS 450,000",
      icon: Truck,
      phone: "+255 674 766 586",
    },
    {
      title: "Scheduled Maintenance & Minor/Major Service",
      desc: "Synthetic engine oil replacement, genuine oil filter, spark plugs, brake pads check, air filters, and suspension greasing.",
      price: "From TZS 150,000",
      icon: Wrench,
      phone: "+255 674 766 586",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            AUTOMOTIVE SOLUTIONS • SWAHIVO COMPANY
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Professional Dealership Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
            From technical pre-purchase inspections to TRA logbook registration and port clearing, Swahivo Company provides end-to-end auto ownership services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <srv.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
                <div className="pt-2">
                  <span className="text-xs font-extrabold text-red-600">{srv.price}</span>
                </div>
              </div>

              <a
                href={`https://wa.me/255674766586?text=${encodeURIComponent(`Hello Swahivo, I want to book: ${srv.title}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Book Service Now</span>
              </a>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
