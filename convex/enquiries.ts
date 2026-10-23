import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitEnquiry = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    buyerId: v.optional(v.id("users")),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const enquiryId = await ctx.db.insert("enquiries", {
      vehicleId: args.vehicleId,
      vehicleTitle: vehicle.title,
      sellerId: vehicle.sellerId,
      buyerId: args.buyerId,
      buyerName: args.buyerName,
      buyerEmail: args.buyerEmail,
      buyerPhone: args.buyerPhone,
      message: args.message,
      status: "new",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add initial message
    if (args.buyerId) {
      await ctx.db.insert("enquiryMessages", {
        enquiryId,
        senderId: args.buyerId,
        senderName: args.buyerName,
        senderRole: "buyer",
        message: args.message,
        createdAt: Date.now(),
      });
    }

    // Increment vehicle enquiry count
    await ctx.db.patch(args.vehicleId, {
      enquiryCount: vehicle.enquiryCount + 1,
    });

    // Notify seller
    await ctx.db.insert("notifications", {
      userId: vehicle.sellerId,
      title: "New Vehicle Enquiry 💬",
      message: `${args.buyerName} enquired about "${vehicle.title}": "${args.message.slice(0, 60)}..."`,
      type: "enquiry",
      link: "/seller/dashboard/enquiries",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true, enquiryId };
  },
});

export const getSellerEnquiries = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enquiries")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();
  },
});

export const getBuyerEnquiries = query({
  args: {
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enquiries")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .order("desc")
      .collect();
  },
});

export const getEnquiryMessages = query({
  args: {
    enquiryId: v.id("enquiries"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enquiryMessages")
      .withIndex("by_enquiry", (q) => q.eq("enquiryId", args.enquiryId))
      .collect();
  },
});

export const addEnquiryMessage = mutation({
  args: {
    enquiryId: v.id("enquiries"),
    senderId: v.id("users"),
    senderName: v.string(),
    senderRole: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const enquiry = await ctx.db.get(args.enquiryId);
    if (!enquiry) throw new Error("Enquiry not found");

    await ctx.db.insert("enquiryMessages", {
      enquiryId: args.enquiryId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      message: args.message,
      createdAt: Date.now(),
    });

    const newStatus = args.senderRole === "seller" ? "responded" : "pending";
    await ctx.db.patch(args.enquiryId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    // Notify the other party
    const targetUserId = args.senderRole === "seller" ? enquiry.buyerId : enquiry.sellerId;
    if (targetUserId) {
      await ctx.db.insert("notifications", {
        userId: targetUserId,
        title: `Reply from ${args.senderName}`,
        message: args.message.slice(0, 100),
        type: "enquiry",
        link: args.senderRole === "seller" ? "/account/enquiries" : "/seller/dashboard/enquiries",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateEnquiryStatus = mutation({
  args: {
    enquiryId: v.id("enquiries"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enquiryId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
