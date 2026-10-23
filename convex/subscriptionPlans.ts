import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db.query("subscriptionPlans").collect();
    return plans.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getPlanBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const adminUpdatePlan = mutation({
  args: {
    planId: v.id("subscriptionPlans"),
    name: v.string(),
    priceMonthlyTzs: v.number(),
    listingLimit: v.number(),
    photosPerVehicle: v.number(),
    description: v.string(),
    features: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");

    await ctx.db.patch(args.planId, {
      name: args.name,
      priceMonthlyTzs: args.priceMonthlyTzs,
      listingLimit: args.listingLimit,
      photosPerVehicle: args.photosPerVehicle,
      description: args.description,
      features: args.features,
      isActive: args.isActive,
    });

    return { success: true };
  },
});
