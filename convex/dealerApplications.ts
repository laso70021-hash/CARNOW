import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listApplications = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("dealerApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("dealerApplications").order("desc").collect();
  },
});

export const approveApplication = mutation({
  args: {
    applicationId: v.id("dealerApplications"),
    adminUserId: v.id("users"),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    await ctx.db.patch(args.applicationId, {
      status: "approved",
      reviewedBy: args.adminUserId,
      reviewedAt: Date.now(),
      adminNotes: args.adminNotes,
    });

    // Ensure user role is seller
    await ctx.db.patch(app.userId, {
      role: "seller",
    });

    // Mark dealer profile as verified
    const dealerProfile = await ctx.db
      .query("dealerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", app.userId))
      .first();

    if (dealerProfile) {
      await ctx.db.patch(dealerProfile._id, {
        isVerified: true,
      });
    }

    // Add notification to user
    await ctx.db.insert("notifications", {
      userId: app.userId,
      title: "Dealership Application Approved! 🎉",
      message: "Congratulations! Your Swahivo dealership application has been approved. You can now manage your inventory and receive verified buyer enquiries.",
      type: "approval",
      link: "/seller/dashboard",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const rejectApplication = mutation({
  args: {
    applicationId: v.id("dealerApplications"),
    adminUserId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    await ctx.db.patch(args.applicationId, {
      status: "rejected",
      reviewedBy: args.adminUserId,
      reviewedAt: Date.now(),
      adminNotes: args.reason,
    });

    await ctx.db.insert("notifications", {
      userId: app.userId,
      title: "Dealership Application Status",
      message: `Your dealership application could not be approved at this time: ${args.reason}`,
      type: "approval",
      link: "/account",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
