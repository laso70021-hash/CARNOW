import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./authHelper";

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const emailNorm = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", emailNorm))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const hashedInput = await hashPassword(args.password);
    if (user.passwordHash !== hashedInput) {
      throw new Error("Invalid email or password");
    }

    if (user.status === "suspended") {
      throw new Error("Your account has been suspended. Please contact support.");
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };
  },
});

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(), // "buyer" | "seller"
    phone: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessLocation: v.optional(v.string()),
    businessDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailNorm = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", emailNorm))
      .first();

    if (existing) {
      throw new Error("An account with this email already exists");
    }

    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Role cannot be registered directly as admin
    const safeRole = args.role === "seller" ? "seller" : "buyer";
    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: emailNorm,
      passwordHash,
      role: safeRole,
      phone: args.phone,
      avatarUrl: safeRole === "seller" ? "/assets/aistudio/logo_52dfade8.png" : undefined,
      status: "active",
      createdAt: Date.now(),
    });

    // If seller signup, create pending dealer application and profile
    if (safeRole === "seller") {
      const bName = args.businessName || `${args.name}'s Dealership`;
      const bLocation = args.businessLocation || "Dar es Salaam, Tanzania";
      const bDesc = args.businessDescription || "Trusted vehicle dealer on Swahivo Cars.";

      const dealerProfileId = await ctx.db.insert("dealerProfiles", {
        userId,
        businessName: bName,
        slug: bName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        location: bLocation,
        address: bLocation,
        phone: args.phone || "+255 770 000 000",
        email: emailNorm,
        description: bDesc,
        rating: 5.0,
        reviewCount: 0,
        isVerified: false,
        totalSales: 0,
        activeListingCount: 0,
        createdAt: Date.now(),
      });

      // Submit application for approval
      await ctx.db.insert("dealerApplications", {
        userId,
        applicantName: args.name,
        businessName: bName,
        location: bLocation,
        phone: args.phone || "",
        email: emailNorm,
        description: bDesc,
        status: "pending",
        createdAt: Date.now(),
      });

      // Assign default Free subscription
      const freePlan = await ctx.db
        .query("subscriptionPlans")
        .withIndex("by_slug", (q) => q.eq("slug", "free"))
        .first();

      if (freePlan) {
        await ctx.db.insert("dealerSubscriptions", {
          userId,
          dealerId: dealerProfileId,
          planId: freePlan._id,
          planName: freePlan.name,
          status: "active",
          listingLimit: freePlan.listingLimit,
          currentActiveListings: 0,
          startDate: Date.now(),
          endDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
          autoRenew: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return {
      userId,
      name: args.name,
      email: emailNorm,
      role: safeRole,
      phone: args.phone,
    };
  },
});

export const getCurrentUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    };
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt,
    }));
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, {
      name: args.name.trim(),
      phone: args.phone,
      avatarUrl: args.avatarUrl || user.avatarUrl,
    });
    return { success: true };
  },
});
