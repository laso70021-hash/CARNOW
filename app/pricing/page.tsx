"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import { Check, HelpCircle, Shield, Zap, Sparkles, Building, ArrowRight, DollarSign } from "lucide-react";
import { PaymentModal } from "@/components/modals/PaymentModal";
import { Id } from "@/convex/_generated/dataModel";

export default function PricingPage() {
  const { user } = useAuth();
  const { currency, setCurrency, formatPrice, exchangeRate } = useCurrency();

  const plans = useQuery(api.subscriptionPlans.listPlans);
  const sellerSub = useQuery(
    api.subscriptions.getSellerSubscription,
    user?.userId ? { userId: user.userId } : "skip"
  );
  const rateData = useQuery(api.exchangeRates.getExchangeRate);

  const subscribeMutation = useMutation(api.subscriptions.subscribeToPlan);

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<{
    invoiceId: Id<"subscriptionInvoices">;
    invoiceNumber: string;
    planName: string;
    amountTzs: number;
  } | null>(null);

  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectPlan = async (plan: {
    _id: Id<"subscriptionPlans">;
    name: string;
    priceMonthlyTzs: number;
  }) => {
    if (!user) {
      alert("Please sign in or register as a Dealer to subscribe to a package.");
      return;
    }

    setLoadingPlanId(plan._id);
    try {
      const res = await subscribeMutation({
        userId: user.userId,
        planId: plan._id,
      });

      if (res.isFree) {
        setSuccessMessage("Free plan activated! You can now post 1 active listing.");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else if (res.invoiceId && res.invoiceNumber) {
        setInvoiceDetails({
          invoiceId: res.invoiceId,
          invoiceNumber: res.invoiceNumber,
          planName: plan.name,
          amountTzs: plan.priceMonthlyTzs,
        });
        setPaymentModalOpen(true);
      }
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      else alert("Could not initiate subscription");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            TRANSPARENT DEALER SAAS TIERS
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Scale Your Auto Dealership in East Africa
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Choose the package that fits your inventory. Clear listing limits enforced transactionally with
            dedicated dealer CRM, high-resolution photo allowances, and buyer lead tools.
          </p>

          {/* Currency Switcher */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Select Display Currency:</span>
            <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setCurrency("TZS")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  currency === "TZS" ? "bg-red-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tanzanian Shilling (TZS)
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  currency === "USD" ? "bg-red-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                US Dollars ($ USD)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Current BOT Reference Rate: 1 USD ≈ {rateData ? rateData.tzsPerUsd.toLocaleString("en-US") : "2,600"} TZS • Billing settlements processed in TZS.
          </div>
        </div>

        {successMessage && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl text-center">
            {successMessage}
          </div>
        )}

        {/* 6 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {plans === undefined ? (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-96 border border-slate-200 animate-pulse" />
            ))
          ) : (
            plans.map((plan) => {
              const isCurrentPlan = sellerSub?.planName === plan.name;
              const isGrowth = plan.slug === "growth";

              return (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                    isGrowth
                      ? "border-red-500 shadow-lg shadow-red-500/10 ring-2 ring-red-500/20"
                      : "border-slate-200/90"
                  }`}
                >
                  {isGrowth && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow-md tracking-wider">
                      Most Popular Tier
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                        {plan.listingLimit} Active Vehicles
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 min-h-[32px]">{plan.description}</p>

                    {/* Price */}
                    <div className="py-2 border-y border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {formatPrice(plan.priceMonthlyTzs)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">/ month</span>
                      </div>
                      {currency === "USD" && plan.priceMonthlyTzs > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          (Exact: TZS {plan.priceMonthlyTzs.toLocaleString("en-US")} / mo)
                        </p>
                      )}
                    </div>

                    {/* Entitlements */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Max {plan.listingLimit} Active Vehicle Listings</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Up to {plan.photosPerVehicle} Photos per Vehicle</span>
                      </div>

                      {plan.features.slice(2).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA button */}
                  <div className="pt-6">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loadingPlanId === plan._id}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition shadow-sm hover:shadow flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default"
                          : isGrowth
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {loadingPlanId === plan._id ? (
                        <span>Processing...</span>
                      ) : isCurrentPlan ? (
                        <span>Current Active Plan</span>
                      ) : (
                        <>
                          <span>{plan.priceMonthlyTzs === 0 ? "Activate Free Plan" : `Upgrade to ${plan.name}`}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs mb-16 overflow-x-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Full Package Comparison</h2>
          <table className="w-full text-xs text-left text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Feature</th>
                <th className="py-3 px-3">Free</th>
                <th className="py-3 px-3">Starter</th>
                <th className="py-3 px-3 text-red-600">Growth</th>
                <th className="py-3 px-3">Professional</th>
                <th className="py-3 px-3">Business</th>
                <th className="py-3 px-3">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Active Listings</td>
                <td className="py-3 px-3">1</td>
                <td className="py-3 px-3">10</td>
                <td className="py-3 px-3 font-bold text-red-600">30</td>
                <td className="py-3 px-3">50</td>
                <td className="py-3 px-3">100</td>
                <td className="py-3 px-3 font-bold">200</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Photos / Vehicle</td>
                <td className="py-3 px-3">5</td>
                <td className="py-3 px-3">10</td>
                <td className="py-3 px-3">15</td>
                <td className="py-3 px-3">20</td>
                <td className="py-3 px-3">25</td>
                <td className="py-3 px-3 font-bold">30</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Dealer CRM</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Yes</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Yes</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Advanced</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Enterprise</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Featured Listing Promotion</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Included</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Included</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Priority</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Spotlight</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">AI Inventory Assistant</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-slate-300">—</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Yes</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Full Suite</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Staff Accounts</td>
                <td className="py-3 px-3">1</td>
                <td className="py-3 px-3">1</td>
                <td className="py-3 px-3">2</td>
                <td className="py-3 px-3">3</td>
                <td className="py-3 px-3">5</td>
                <td className="py-3 px-3 font-bold">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Frequently Asked Questions</h2>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">How is the listing capacity enforced?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              When your active inventory reaches the package ceiling (e.g., 10 vehicles on Starter), our Convex database
              rejects new vehicle activations with a capacity message. Your older or sold listings remain safely saved in
              your inventory archive.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">What payment methods are supported?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We support Tanzania mobile money (Vodacom M-Pesa Till 565656, Tigo Pesa 888999, Airtel Money 777666) as well as direct CRDB Bank & NMB Bank transfers.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      {invoiceDetails && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          invoiceId={invoiceDetails.invoiceId}
          invoiceNumber={invoiceDetails.invoiceNumber}
          planName={invoiceDetails.planName}
          amountTzs={invoiceDetails.amountTzs}
        />
      )}
    </div>
  );
}
