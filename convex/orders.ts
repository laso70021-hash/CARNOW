import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    buyerId: v.optional(v.id("users")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    deliveryLocation: v.string(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const orderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const orderId = await ctx.db.insert("orders", {
      orderNumber: orderNum,
      vehicleId: args.vehicleId,
      vehicleTitle: vehicle.title,
      sellerId: vehicle.sellerId,
      buyerId: args.buyerId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      deliveryLocation: args.deliveryLocation,
      amountTzs: vehicle.priceTzs,
      status: "pending",
      paymentMethod: args.paymentMethod,
      dateStr,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: vehicle.sellerId,
      title: `New Reservation/Order: ${orderNum}`,
      message: `${args.customerName} placed an order for ${vehicle.title} (TZS ${vehicle.priceTzs.toLocaleString()}).`,
      type: "order",
      link: "/seller/dashboard/orders",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true, orderId, orderNumber: orderNum };
  },
});

export const getSellerOrders = query({
  args: {
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();
  },
});

export const getBuyerOrders = query({
  args: {
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .order("desc")
      .collect();
  },
});

export const adminListAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(), // "pending" | "payment_processing" | "completed" | "canceled"
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, { status: args.status });

    // If completed, mark vehicle as sold and increment seller sales
    if (args.status === "completed") {
      await ctx.db.patch(order.vehicleId, {
        status: "sold",
      });

      const dealerProfile = await ctx.db
        .query("dealerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", order.sellerId))
        .first();

      if (dealerProfile) {
        await ctx.db.patch(dealerProfile._id, {
          totalSales: dealerProfile.totalSales + 1,
        });
      }
    }

    if (order.buyerId) {
      await ctx.db.insert("notifications", {
        userId: order.buyerId,
        title: `Order ${order.orderNumber} Updated`,
        message: `Your order for ${order.vehicleTitle} is now marked as ${args.status}.`,
        type: "order",
        link: "/account/orders",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});
