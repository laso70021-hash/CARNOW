import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDealerByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dealerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getDealerBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const dealer = await ctx.db
      .query("dealerProfiles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!dealer) return null;

    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_seller", (q) => q.eq("sellerId", dealer.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return {
      ...dealer,
      vehicles,
    };
  },
});

export const listAllDealers = query({
  args: {},
  handler: async (ctx) => {
    const dealers = await ctx.db.query("dealerProfiles").collect();
    return dealers;
  },
});

export const updateDealerProfile = mutation({
  args: {
    userId: v.id("users"),
    businessName: v.string(),
    location: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    tinNumber: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("dealerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Dealer profile not found");
    }

    await ctx.db.patch(profile._id, {
      businessName: args.businessName,
      location: args.location,
      address: args.address,
      phone: args.phone,
      email: args.email,
      description: args.description,
      logoUrl: args.logoUrl || profile.logoUrl,
      bannerUrl: args.bannerUrl || profile.bannerUrl,
      tinNumber: args.tinNumber,
      registrationNumber: args.registrationNumber,
    });

    return { success: true };
  },
});
