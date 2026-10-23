"use client";

import React, { useState } from "react";
import { useAuth, useCurrency } from "@/components/providers/ConvexClientProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, CheckCircle, AlertCircle, Percent, Calculator } from "lucide-react";

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: Id<"vehicles">;
  vehicleTitle?: string;
  vehiclePriceTzs?: number;
}

export function FinancingModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleTitle,
  vehiclePriceTzs = 45000000,
}: FinancingModalProps) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const submitFinancingMutation = useMutation(api.meta.submitFinancing);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+255 ");
  const [email, setEmail] = useState(user?.email || "");
  const [monthlyIncome, setMonthlyIncome] = useState(3500000);
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePriceTzs * 0.2)); // 20% down
  const [tenure, setTenure] = useState(36); // 36 months
  const [employmentType, setEmploymentType] = useState("Employed");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const loanAmount = Math.max(0, vehiclePriceTzs - downPayment);
  // Rough estimate: 12% interest per annum
  const annualInterestRate = 0.12;
  const monthlyRate = annualInterestRate / 12;
  const estimatedMonthlyPayment = Math.round(
    loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1)
      : 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitFinancingMutation({
        applicantName: name.trim(),
        applicantPhone: phone.trim(),
        applicantEmail: email.trim(),
        vehicleId,
        vehicleTitle,
        monthlyIncomeTzs: Number(monthlyIncome),
        downPaymentTzs: Number(downPayment),
        requestedLoanAmountTzs: loanAmount,
        preferredTenureMonths: Number(tenure),
        employmentType,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Financing submission failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Apply for Vehicle Financing</h3>
            <p className="text-xs text-red-400 font-semibold truncate max-w-sm">
              {vehicleTitle || "Swahivo Partner Auto Loans"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-600">
              Our partner bank auto loan officers will review your down payment and income documentation. You will receive a call within 24 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Loan Estimate Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Vehicle Price:</span>
                <span className="text-xs font-bold text-slate-800">{formatPrice(vehiclePriceTzs)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Loan Principal:</span>
                <span className="text-xs font-bold text-slate-800">{formatPrice(loanAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-red-700">Estimated Monthly Installment:</span>
                <span className="text-base font-extrabold text-red-600">
                  {formatPrice(estimatedMonthlyPayment)} / mo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Down Payment (TZS)</label>
                <input
                  type="number"
                  required
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Tenure</label>
                <select
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={48}>48 Months (4 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Net Income (TZS)</label>
                <input
                  type="number"
                  required
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  <option value="Employed">Formally Employed</option>
                  <option value="Business Owner">Business Owner / Trader</option>
                  <option value="Self-Employed">Self-Employed Professional</option>
                  <option value="Diaspora">Tanzanian Diaspora</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Loan Pre-Qualification"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
