import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBooking = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    buyerId: v.optional(v.id("users")),
    buyerName: v.string(),
    buyerPhone: v.string(),
    buyerEmail: v.string(),
    bookingType: v.string(), // "test_drive" | "inspection" | "service"
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const bookingId = await ctx.db.insert("bookings", {
      vehicleId: args.vehicleId,
      vehicleTitle: vehicle.title,
      sellerId: vehicle.sellerId,
      buyerId: args.buyerId,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      buyerEmail: args.buyerEmail,
      bookingType: args.bookingType,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      status: "pending",
      notes: args.notes,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: vehicle.sellerId,
      title: "New Test Drive / Inspection Booking 📅",
      message: `${args.buyerName} requested a ${args.bookingType.replace("_", " ")} on ${args.scheduledDate} at ${args.scheduledTime} for ${vehicle.title}.`,
      type: "booking",
      link: "/seller/dashboard/bookings",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true, bookingId };
  },
});

export const getSellerBookings = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();
  },
});

export const getBuyerBookings = query({
  args: {
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .order("desc")
      .collect();
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.string(), // "confirmed" | "completed" | "canceled"
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.bookingId, { status: args.status });

    if (booking.buyerId) {
      await ctx.db.insert("notifications", {
        userId: booking.buyerId,
        title: `Booking Update: ${args.status.toUpperCase()}`,
        message: `Your booking for ${booking.vehicleTitle} on ${booking.scheduledDate} has been updated to ${args.status}.`,
        type: "booking",
        link: "/account/bookings",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});
