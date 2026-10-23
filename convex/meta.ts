import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Brands
export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vehicleBrands").collect();
  },
});

// Categories
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vehicleCategories").collect();
  },
});

// Accessories
export const listAccessories = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category && args.category !== "All") {
      return await ctx.db
        .query("accessories")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("accessories").collect();
  },
});

// Services
export const listServices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services").collect();
  },
});

// Financing
export const submitFinancing = mutation({
  args: {
    applicantName: v.string(),
    applicantPhone: v.string(),
    applicantEmail: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    vehicleTitle: v.optional(v.string()),
    monthlyIncomeTzs: v.number(),
    downPaymentTzs: v.number(),
    employmentType: v.string(),
    requestedLoanAmountTzs: v.number(),
    preferredTenureMonths: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("financingApplications", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return { success: true, id };
  },
});

export const listFinancingApplications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("financingApplications").order("desc").collect();
  },
});

export const updateFinancingStatus = mutation({
  args: {
    id: v.id("financingApplications"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return { success: true };
  },
});

// Reviews
export const listReviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
  },
});

// Promotions
export const listPromotions = query({
  args: {
    dealerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.dealerId) {
      return await ctx.db
        .query("promotedListings")
        .withIndex("by_dealer", (q) => q.eq("dealerId", args.dealerId!))
        .collect();
    }
    return await ctx.db.query("promotedListings").collect();
  },
});

export const requestPromotion = mutation({
  args: {
    dealerId: v.id("users"),
    vehicleId: v.id("vehicles"),
    placement: v.string(),
    durationDays: v.number(),
    priceTzs: v.number(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const id = await ctx.db.insert("promotedListings", {
      vehicleId: args.vehicleId,
      vehicleTitle: vehicle.title,
      dealerId: args.dealerId,
      placement: args.placement,
      priceTzs: args.priceTzs,
      startDate: Date.now(),
      endDate: Date.now() + args.durationDays * 24 * 60 * 60 * 1000,
      status: "pending_approval",
      paymentStatus: "pending",
      impressions: 0,
      clicks: 0,
      createdAt: Date.now(),
    });

    return { success: true, id };
  },
});

// Newsletter Subscriptions
export const subscribeNewsletter = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const emailNorm = args.email.trim().toLowerCase();
    if (!emailNorm.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    const existing = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", emailNorm))
      .first();

    if (!existing) {
      await ctx.db.insert("newsletterSubscriptions", {
        email: emailNorm,
        status: "active",
        createdAt: Date.now(),
      });
    }
    return { success: true };
  },
});

export const listNewsletterSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsletterSubscriptions").order("desc").collect();
  },
});

// Add Accessory Mutation
export const createAccessory = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    priceTzs: v.number(),
    condition: v.string(),
    image: v.string(),
    sellerId: v.optional(v.id("users")),
    sellerName: v.optional(v.string()),
    stock: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("accessories", {
      title: args.title,
      category: args.category,
      priceTzs: args.priceTzs,
      condition: args.condition,
      image: args.image,
      sellerId: args.sellerId,
      sellerName: args.sellerName || "Swahivo Verified Dealer",
      stock: args.stock,
      description: args.description,
      status: "active",
      createdAt: Date.now(),
    });
    return { success: true, id };
  },
});

