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
      status: user.status,
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
    planSlug: v.optional(v.string()),
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

    // Free plan activates automatically. Paid plans place seller on hold until payment and admin approval.
    const isFreePlan = !args.planSlug || args.planSlug.toLowerCase() === "free";
    const initialStatus = safeRole === "seller" ? (isFreePlan ? "active" : "on_hold") : "active";

    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: emailNorm,
      passwordHash,
      role: safeRole,
      phone: args.phone,
      avatarUrl: safeRole === "seller" ? "/assets/aistudio/logo_52dfade8.png" : undefined,
      status: initialStatus,
      createdAt: Date.now(),
    });

    // If seller signup, create dealer profile, application and subscription
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
        phone: args.phone || "+255 674 766 586",
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
        status: isFreePlan ? "approved" : "pending",
        createdAt: Date.now(),
      });

      // Find the chosen subscription plan
      const targetSlug = args.planSlug?.toLowerCase() || "free";
      const targetPlan = await ctx.db
        .query("subscriptionPlans")
        .withIndex("by_slug", (q) => q.eq("slug", targetSlug))
        .first();

      const freePlan = targetSlug === "free" ? targetPlan : await ctx.db
        .query("subscriptionPlans")
        .withIndex("by_slug", (q) => q.eq("slug", "free"))
        .first();

      const activePlan = targetPlan || freePlan;

      if (activePlan) {
        if (!isFreePlan && activePlan.priceMonthlyTzs > 0) {
          // Generate pending invoice for paid plan
          const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
          const invoiceId = await ctx.db.insert("subscriptionInvoices", {
            invoiceNumber: invoiceNum,
            userId,
            dealerId: dealerProfileId,
            planId: activePlan._id,
            planName: activePlan.name,
            amountTzs: activePlan.priceMonthlyTzs,
            amountUsd: Math.round(activePlan.priceMonthlyTzs * 0.000385),
            currency: "TZS",
            status: "pending",
            dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
            notes: `Initial subscription setup for ${activePlan.name} tier. Account pending payment & admin verification.`,
            createdAt: Date.now(),
          });

          // Subscription in on_hold/past_due state
          await ctx.db.insert("dealerSubscriptions", {
            userId,
            dealerId: dealerProfileId,
            planId: activePlan._id,
            planName: activePlan.name,
            status: "past_due",
            listingLimit: activePlan.listingLimit,
            currentActiveListings: 0,
            startDate: Date.now(),
            endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
            autoRenew: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          // Notification to seller
          await ctx.db.insert("notifications", {
            userId,
            title: "Account On Hold - Payment Pending",
            message: `Your seller account was registered for the ${activePlan.name} tier. Please complete payment of ${activePlan.priceMonthlyTzs.toLocaleString()} TZS (Invoice ${invoiceNum}) to activate your listings.`,
            type: "subscription",
            link: "/seller/dashboard/subscription",
            isRead: false,
            createdAt: Date.now(),
          });
        } else {
          // Free plan activated automatically
          await ctx.db.insert("dealerSubscriptions", {
            userId,
            dealerId: dealerProfileId,
            planId: activePlan._id,
            planName: activePlan.name,
            status: "active",
            listingLimit: activePlan.listingLimit,
            currentActiveListings: 0,
            startDate: Date.now(),
            endDate: Date.now() + 365 * 24 * 60 * 60 * 1000,
            autoRenew: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
    }

    return {
      userId,
      name: args.name,
      email: emailNorm,
      role: safeRole,
      phone: args.phone,
      status: initialStatus,
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
