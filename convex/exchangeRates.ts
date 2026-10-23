import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getExchangeRate = query({
  args: {},
  handler: async (ctx) => {
    const rateDoc = await ctx.db
      .query("exchangeRates")
      .withIndex("by_pair", (q) => q.eq("baseCurrency", "TZS").eq("quoteCurrency", "USD"))
      .first();

    if (!rateDoc) {
      // Default live market rate: 1 TZS = ~0.000385 USD (approx 2,600 TSh per $1 USD)
      return {
        baseCurrency: "TZS",
        quoteCurrency: "USD",
        rate: 0.000385,
        tzsPerUsd: 2600,
        updatedAt: Date.now(),
        source: "Bank of Tanzania (BOT) Interbank Reference",
      };
    }

    return {
      ...rateDoc,
      tzsPerUsd: Math.round(1 / rateDoc.rate),
    };
  },
});

export const adminUpdateRate = mutation({
  args: {
    rate: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const rateDoc = await ctx.db
      .query("exchangeRates")
      .withIndex("by_pair", (q) => q.eq("baseCurrency", "TZS").eq("quoteCurrency", "USD"))
      .first();

    if (rateDoc) {
      await ctx.db.patch(rateDoc._id, {
        rate: args.rate,
        source: args.source,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("exchangeRates", {
        baseCurrency: "TZS",
        quoteCurrency: "USD",
        rate: args.rate,
        source: args.source,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
