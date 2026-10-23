"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/ConvexClientProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, CheckCircle, AlertCircle, Smartphone, Building, ShieldCheck } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: Id<"subscriptionInvoices">;
  invoiceNumber: string;
  planName: string;
  amountTzs: number;
}

export function PaymentModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  planName,
  amountTzs,
}: PaymentModalProps) {
  const { user } = useAuth();
  const submitReceiptMutation = useMutation(api.invoices.submitPaymentReceipt);

  const [method, setMethod] = useState<"M-Pesa" | "Tigo Pesa" | "Airtel Money" | "Bank Transfer">("M-Pesa");
  const [referenceCode, setReferenceCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "+255 ");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      await submitReceiptMutation({
        invoiceId,
        userId: user.userId,
        paymentMethod: method,
        referenceCode: referenceCode.trim().toUpperCase(),
        phoneNumber: phoneNumber.trim(),
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
        setError("Payment submission failed");
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
            <h3 className="text-base font-bold">Pay Subscription Invoice</h3>
            <p className="text-xs text-red-400 font-semibold">{invoiceNumber} • {planName} Package</p>
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
            <h4 className="text-base font-bold text-slate-900">Payment Submitted for Verification!</h4>
            <p className="text-xs text-slate-600">
              Reference code <strong>{referenceCode.toUpperCase()}</strong> has been recorded. Swahivo finance will verify your transaction shortly and activate your listing capacity.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Total Amount Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Payable Amount</span>
                <p className="text-xl font-extrabold text-red-600">TZS {amountTzs.toLocaleString("en-US")}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Listing Limit</span>
                <p className="text-xs font-bold text-slate-800">{planName} Tier</p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Choose Payment Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {(["M-Pesa", "Tigo Pesa", "Airtel Money", "Bank Transfer"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-left flex items-center gap-2 ${
                      method === m
                        ? "bg-red-50 border-red-500 text-red-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m === "Bank Transfer" ? <Building className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Instructions Box */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Payment Instructions for {method}:
              </p>
              {method === "M-Pesa" && (
                <p className="text-[11px] leading-relaxed">
                  Dial <strong>*150*00#</strong> &gt; Lipa kwa M-Pesa &gt; Enter Merchant / Till Number: <strong>565656</strong> (Swahivo Auto Ltd) &gt; Amount: <strong>{amountTzs.toLocaleString("en-US")}</strong> &gt; Enter PIN &gt; Copy transaction reference code below.
                </p>
              )}
              {method === "Tigo Pesa" && (
                <p className="text-[11px] leading-relaxed">
                  Dial <strong>*150*01#</strong> &gt; Pay Merchant &gt; Lipa Namba: <strong>888999</strong> &gt; Amount: <strong>{amountTzs.toLocaleString("en-US")}</strong> &gt; Enter PIN &gt; Paste SMS reference below.
                </p>
              )}
              {method === "Airtel Money" && (
                <p className="text-[11px] leading-relaxed">
                  Dial <strong>*150*60#</strong> &gt; Lipa na Airtel Money &gt; Merchant Number: <strong>777666</strong> &gt; Enter amount &gt; Confirm &gt; Paste reference below.
                </p>
              )}
              {method === "Bank Transfer" && (
                <p className="text-[11px] leading-relaxed">
                  CRDB Bank Tanzania: Account: <strong>0150294827001</strong> (Swahivo Technologies Ltd) | Reference: <strong>{invoiceNumber}</strong>.
                </p>
              )}
            </div>

            {/* Input fields */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Reference Code (from SMS / Bank Receipt)
              </label>
              <input
                type="text"
                required
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="e.g. QA98XZ120"
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number Used for Payment</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255 770 000 000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Submit Payment for Verification"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
