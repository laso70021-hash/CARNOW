import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSellerSubscription = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Count active listings
    const activeVehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const sub = await ctx.db
      .query("dealerSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!sub) {
      // Default Free entitlement
      return {
        planName: "Free",
        listingLimit: 1,
        currentActiveListings: activeVehicles.length,
        status: "active",
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        canAddListing: activeVehicles.length < 1,
      };
    }

    return {
      _id: sub._id,
      planId: sub.planId,
      planName: sub.planName,
      listingLimit: sub.listingLimit,
      currentActiveListings: activeVehicles.length,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      canAddListing: activeVehicles.length < sub.listingLimit,
    };
  },
});

export const subscribeToPlan = mutation({
  args: {
    userId: v.id("users"),
    planId: v.id("subscriptionPlans"),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Subscription plan not found");

    const dealer = await ctx.db
      .query("dealerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // If plan is Free, activate immediately
    if (plan.priceMonthlyTzs === 0) {
      const existingSub = await ctx.db
        .query("dealerSubscriptions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (existingSub) {
        await ctx.db.patch(existingSub._id, {
          planId: plan._id,
          planName: plan.name,
          listingLimit: plan.listingLimit,
          status: "active",
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("dealerSubscriptions", {
          userId: args.userId,
          dealerId: dealer?._id,
          planId: plan._id,
          planName: plan.name,
          status: "active",
          listingLimit: plan.listingLimit,
          currentActiveListings: 0,
          startDate: Date.now(),
          endDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
          autoRenew: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return {
        success: true,
        isFree: true,
        message: "Free plan activated successfully.",
      };
    }

    // For paid plan, generate real subscription invoice
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceId = await ctx.db.insert("subscriptionInvoices", {
      invoiceNumber: invoiceNum,
      userId: args.userId,
      dealerId: dealer?._id,
      planId: plan._id,
      planName: plan.name,
      amountTzs: plan.priceMonthlyTzs,
      amountUsd: Math.round((plan.priceMonthlyTzs * 0.000385) * 100) / 100,
      currency: "TZS",
      status: "pending",
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
    });

    return {
      success: true,
      isFree: false,
      invoiceId,
      invoiceNumber: invoiceNum,
      amountTzs: plan.priceMonthlyTzs,
    };
  },
});
