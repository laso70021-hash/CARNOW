import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInvoicesForSeller = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptionInvoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getAllInvoices = query({
  args: {},
  handler: async (ctx) => {
    const invoices = await ctx.db.query("subscriptionInvoices").order("desc").collect();
    return invoices;
  },
});

export const getInvoiceById = query({
  args: {
    invoiceId: v.id("subscriptionInvoices"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.invoiceId);
  },
});

export const submitPaymentReceipt = mutation({
  args: {
    invoiceId: v.id("subscriptionInvoices"),
    userId: v.id("users"),
    paymentMethod: v.string(), // "M-Pesa" | "Tigo Pesa" | "Airtel Money" | "Bank Transfer"
    referenceCode: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    // Save payment record
    const paymentId = await ctx.db.insert("subscriptionPayments", {
      invoiceId: args.invoiceId,
      userId: args.userId,
      amountTzs: invoice.amountTzs,
      paymentMethod: args.paymentMethod,
      referenceCode: args.referenceCode.trim().toUpperCase(),
      phoneNumber: args.phoneNumber,
      status: "pending_verification",
      submittedAt: Date.now(),
    });

    await ctx.db.patch(args.invoiceId, {
      paymentMethod: args.paymentMethod,
      paymentReference: args.referenceCode.trim().toUpperCase(),
    });

    return { success: true, paymentId };
  },
});

export const adminVerifyPayment = mutation({
  args: {
    invoiceId: v.id("subscriptionInvoices"),
    adminUserId: v.id("users"),
    action: v.string(), // "approve" | "reject"
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only administrators can verify subscription payments");
    }

    const payment = await ctx.db
      .query("subscriptionPayments")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.invoiceId))
      .first();

    if (args.action === "approve") {
      await ctx.db.patch(args.invoiceId, {
        status: "paid",
        paidAt: Date.now(),
        notes: args.adminNotes,
      });

      if (payment) {
        await ctx.db.patch(payment._id, {
          status: "verified",
          verifiedBy: args.adminUserId,
          verifiedAt: Date.now(),
          adminNotes: args.adminNotes,
        });
      }

      // Upgrade/Activate dealer subscription plan!
      const plan = await ctx.db.get(invoice.planId);
      if (plan) {
        const existingSub = await ctx.db
          .query("dealerSubscriptions")
          .withIndex("by_user", (q) => q.eq("userId", invoice.userId))
          .first();

        if (existingSub) {
          await ctx.db.patch(existingSub._id, {
            planId: plan._id,
            planName: plan.name,
            listingLimit: plan.listingLimit,
            status: "active",
            startDate: Date.now(),
            endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.insert("dealerSubscriptions", {
            userId: invoice.userId,
            dealerId: invoice.dealerId,
            planId: plan._id,
            planName: plan.name,
            status: "active",
            listingLimit: plan.listingLimit,
            currentActiveListings: 0,
            startDate: Date.now(),
            endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            autoRenew: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }

      // Also update user status from "on_hold" to "active"
      const userDoc = await ctx.db.get(invoice.userId);
      if (userDoc && userDoc.status === "on_hold") {
        await ctx.db.patch(userDoc._id, {
          status: "active",
          updatedAt: Date.now(),
        });
      }

      // Send confirmation notification
      await ctx.db.insert("notifications", {
        userId: invoice.userId,
        title: "Subscription Activated! 🚗",
        message: `Your payment for the ${invoice.planName} tier has been verified. You can now list up to ${invoice.planName} active vehicles.`,
        type: "subscription",
        link: "/seller/dashboard/subscription",
        isRead: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.invoiceId, {
        status: "failed",
        notes: args.adminNotes,
      });
      if (payment) {
        await ctx.db.patch(payment._id, {
          status: "rejected",
          verifiedBy: args.adminUserId,
          verifiedAt: Date.now(),
          adminNotes: args.adminNotes,
        });
      }
    }

    return { success: true };
  },
});
