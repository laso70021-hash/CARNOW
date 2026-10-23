"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Phone, Mail, MapPin, Clock, Check, Send, AlertCircle } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const subscribeMutation = useMutation(api.meta.subscribeNewsletter);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubscribeError(null);
    try {
      await subscribeMutation({ email: email.trim() });
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err: unknown) {
      if (err instanceof Error) setSubscribeError(err.message);
      else setSubscribeError("Failed to subscribe to newsletter.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="relative w-44 h-12">
              <Image
                src="/assets/aistudio/logo_52dfade8.png"
                alt="Swahivo Company"
                fill
                className="object-contain brightness-0 invert"
                sizes="180px"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">Swahivo Company</strong> — Your premier automotive marketplace and
              dealership SaaS in Tanzania and Zanzibar. Offering verified inventory, TRA customs compliance,
              genuine accessories, dealer warranties, and flexible financing.
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Follow Us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/255674766586"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition text-xs font-bold"
                  title="WhatsApp Swahivo"
                >
                  WA
                </a>
                <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white transition text-xs font-bold cursor-pointer">
                  FB
                </span>
                <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white transition text-xs font-bold cursor-pointer">
                  IG
                </span>
                <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white transition text-xs font-bold cursor-pointer">
                  YT
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-red-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="hover:text-red-500 transition">
                  Cars Marketplace
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-red-500 transition text-red-400 font-semibold">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dealers" className="hover:text-red-500 transition">
                  Verified Dealerships
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="hover:text-red-500 transition">
                  Auto Accessories
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-red-500 transition">
                  Vehicle Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-500 transition">
                  About Swahivo
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-500 transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Swahivo Company</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold">Zanzibar Headquarters</p>
                  <p>Plot 42, Airport Road, Kiembe Samaki, Zanzibar</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold">Dar es Salaam Regional Hub</p>
                  <p>Ali Hassan Mwinyi Road, Victoria, Dar es Salaam</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <a href="tel:+255674766586" className="text-slate-300 hover:text-white">
                  Direct Line: <strong className="text-white">+255 674 766 586</strong>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href="mailto:hello@swahivo.com" className="text-slate-300 hover:text-white">
                  Email: <strong className="text-white">hello@swahivo.com</strong>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-red-500 shrink-0" />
                <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Newsletter</h4>
            <p className="text-xs text-slate-400 mb-4">
              Get the latest cars, price drops, and exclusive dealer offers directly in your inbox.
            </p>
            {subscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Thank you! Your email has been saved to the newsletter list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />
                </div>
                {subscribeError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{subscribeError}</span>
                  </p>
                )}
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-red-600/20 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{subscribing ? "Saving..." : "Subscribe"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Swahivo Car Dealership. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-slate-400 transition">
              Terms & Conditions
            </Link>
            <Link href="/about" className="hover:text-slate-400 transition">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-slate-400 transition">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
