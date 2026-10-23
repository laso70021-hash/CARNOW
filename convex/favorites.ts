import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleFavorite = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_vehicle", (q) =>
        q.eq("userId", args.userId).eq("vehicleId", args.vehicleId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    } else {
      await ctx.db.insert("favorites", {
        userId: args.userId,
        vehicleId: args.vehicleId,
        createdAt: Date.now(),
      });
      return { favorited: true };
    }
  },
});

export const getFavorites = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const vehiclePromises = favs.map((f) => ctx.db.get(f.vehicleId));
    const vehicles = await Promise.all(vehiclePromises);
    return vehicles.filter(Boolean);
  },
});

export const isFavorited = query({
  args: {
    userId: v.optional(v.id("users")),
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_vehicle", (q) =>
        q.eq("userId", args.userId!).eq("vehicleId", args.vehicleId)
      )
      .first();
    return !!existing;
  },
});
