import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPublicVehicles = query({
  args: {
    brand: v.optional(v.string()),
    condition: v.optional(v.string()),
    location: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    transmission: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
    onlyFeatured: v.optional(v.boolean()),
    sortBy: v.optional(v.string()), // "price_asc" | "price_desc" | "newest" | "mileage"
  },
  handler: async (ctx, args) => {
    let vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Filters
    if (args.brand && args.brand !== "All") {
      vehicles = vehicles.filter((v) => v.brand.toLowerCase() === args.brand!.toLowerCase());
    }
    if (args.condition && args.condition !== "All") {
      vehicles = vehicles.filter((v) => v.condition.toLowerCase() === args.condition!.toLowerCase());
    }
    if (args.location && args.location !== "All") {
      vehicles = vehicles.filter((v) => v.location.toLowerCase().includes(args.location!.toLowerCase()));
    }
    if (args.fuelType && args.fuelType !== "All") {
      vehicles = vehicles.filter((v) => v.fuelType.toLowerCase() === args.fuelType!.toLowerCase());
    }
    if (args.transmission && args.transmission !== "All") {
      vehicles = vehicles.filter((v) => v.transmission.toLowerCase() === args.transmission!.toLowerCase());
    }
    if (args.minPrice !== undefined) {
      vehicles = vehicles.filter((v) => v.priceTzs >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      vehicles = vehicles.filter((v) => v.priceTzs <= args.maxPrice!);
    }
    if (args.onlyFeatured) {
      vehicles = vehicles.filter((v) => v.isFeatured);
    }
    if (args.searchQuery && args.searchQuery.trim().length > 0) {
      const q = args.searchQuery.trim().toLowerCase();
      vehicles = vehicles.filter((v) =>
        v.title.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    }

    // Sort
    if (args.sortBy === "price_asc") {
      vehicles.sort((a, b) => a.priceTzs - b.priceTzs);
    } else if (args.sortBy === "price_desc") {
      vehicles.sort((a, b) => b.priceTzs - a.priceTzs);
    } else if (args.sortBy === "mileage") {
      vehicles.sort((a, b) => a.mileage - b.mileage);
    } else {
      // Default: newest
      vehicles.sort((a, b) => b.createdAt - a.createdAt);
    }

    return vehicles;
  },
});

export const getVehicleBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db
      .query("vehicles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!vehicle) return null;

    // Fetch seller and dealership info
    const seller = await ctx.db.get(vehicle.sellerId);
    let dealer = null;
    if (vehicle.dealerId) {
      dealer = await ctx.db.get(vehicle.dealerId);
    } else {
      dealer = await ctx.db
        .query("dealerProfiles")
        .withIndex("by_user", (q) => q.eq("userId", vehicle.sellerId))
        .first();
    }

    return {
      ...vehicle,
      sellerName: seller?.name || "Verified Dealer",
      sellerPhone: seller?.phone || "+255 674 766 586",
      sellerEmail: seller?.email || "hello@swahivo.com",
      dealership: dealer
        ? {
            businessName: dealer.businessName,
            location: dealer.location,
            address: dealer.address,
            phone: dealer.phone,
            rating: dealer.rating,
            isVerified: dealer.isVerified,
            logoUrl: dealer.logoUrl,
          }
        : null,
    };
  },
});

export const getVehicleById = query({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.vehicleId);
  },
});

export const getSellerVehicles = query({
  args: {
    sellerId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect();

    if (args.status && args.status !== "all") {
      vehicles = vehicles.filter((v) => v.status === args.status);
    }

    return vehicles;
  },
});

export const createVehicle = mutation({
  args: {
    sellerId: v.id("users"),
    title: v.string(),
    brand: v.string(),
    model: v.string(),
    variant: v.optional(v.string()),
    condition: v.string(),
    year: v.number(),
    mileage: v.number(),
    fuelType: v.string(),
    transmission: v.string(),
    engineCapacity: v.optional(v.string()),
    priceTzs: v.number(),
    location: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    optionalServices: v.optional(v.array(v.string())),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Verify seller
    const user = await ctx.db.get(args.sellerId);
    if (!user) throw new Error("Authenticated seller account not found");

    // 2. Retrieve subscription plan & limits
    const sub = await ctx.db
      .query("dealerSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.sellerId))
      .first();

    const listingLimit = sub ? sub.listingLimit : 1; // Default Free entitlement: 1 active listing

    // 3. Check current active listings count
    const activeListings = await ctx.db
      .query("vehicles")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // 4. Determine initial status:
    // If seller is within listing limit, new vehicle is submitted for admin approval (pending_approval).
    // If already at or above limit, we alert the seller that their active capacity is full.
    if (activeListings.length >= listingLimit) {
      throw new Error(
        `Listing limit reached (${activeListings.length}/${listingLimit} active listings on your current ${sub?.planName || "Free"} plan). Upgrade your dealer package to publish additional vehicles.`
      );
    }

    // Find dealer profile if any
    const dealerProfile = await ctx.db
      .query("dealerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.sellerId))
      .first();

    // Generate unique slug
    const baseSlug = `${args.brand}-${args.model}-${args.year}-${Math.floor(1000 + Math.random() * 9000)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const primaryImage = args.images.length > 0
      ? args.images[0]
      : "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png";

    const vehicleId = await ctx.db.insert("vehicles", {
      title: args.title.trim(),
      slug: baseSlug,
      brand: args.brand,
      model: args.model,
      variant: args.variant,
      condition: args.condition,
      year: args.year,
      mileage: args.mileage,
      fuelType: args.fuelType,
      transmission: args.transmission,
      engineCapacity: args.engineCapacity,
      priceTzs: args.priceTzs,
      location: args.location,
      description: args.description,
      features: args.features,
      optionalServices: args.optionalServices || [],
      sellerId: args.sellerId,
      dealerId: dealerProfile?._id,
      status: "pending_approval", // Requires admin review
      isFeatured: false,
      viewCount: 0,
      enquiryCount: 0,
      images: args.images,
      primaryImage,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Notify seller
    await ctx.db.insert("notifications", {
      userId: args.sellerId,
      title: "Vehicle Submitted for Review",
      message: `Your listing "${args.title}" has been submitted and is currently pending admin approval.`,
      type: "system",
      link: "/seller/dashboard/vehicles",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true, vehicleId, slug: baseSlug };
  },
});

export const updateVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    sellerId: v.id("users"),
    title: v.string(),
    brand: v.string(),
    model: v.string(),
    variant: v.optional(v.string()),
    condition: v.string(),
    year: v.number(),
    mileage: v.number(),
    fuelType: v.string(),
    transmission: v.string(),
    engineCapacity: v.optional(v.string()),
    priceTzs: v.number(),
    location: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    optionalServices: v.optional(v.array(v.string())),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    // Authorization: seller or admin
    const user = await ctx.db.get(args.sellerId);
    if (vehicle.sellerId !== args.sellerId && user?.role !== "admin") {
      throw new Error("Unauthorized to edit this vehicle");
    }

    const primaryImage = args.images.length > 0 ? args.images[0] : vehicle.primaryImage;

    await ctx.db.patch(args.vehicleId, {
      title: args.title,
      brand: args.brand,
      model: args.model,
      variant: args.variant,
      condition: args.condition,
      year: args.year,
      mileage: args.mileage,
      fuelType: args.fuelType,
      transmission: args.transmission,
      engineCapacity: args.engineCapacity,
      priceTzs: args.priceTzs,
      location: args.location,
      description: args.description,
      features: args.features,
      optionalServices: args.optionalServices,
      images: args.images,
      primaryImage,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const setVehicleStatus = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    sellerId: v.id("users"),
    status: v.string(), // "active" | "inactive" | "sold" | "archived"
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const user = await ctx.db.get(args.sellerId);
    if (vehicle.sellerId !== args.sellerId && user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // If activating, strictly enforce listing limit!
    if (args.status === "active") {
      const sub = await ctx.db
        .query("dealerSubscriptions")
        .withIndex("by_user", (q) => q.eq("userId", vehicle.sellerId))
        .first();

      const listingLimit = sub ? sub.listingLimit : 1;

      const activeVehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_seller", (q) => q.eq("sellerId", vehicle.sellerId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      if (activeVehicles.length >= listingLimit && vehicle.status !== "active") {
        throw new Error(
          `Cannot activate listing: Listing capacity full (${activeVehicles.length}/${listingLimit} on ${sub?.planName || "Free"} plan). Upgrade your plan to activate more vehicles.`
        );
      }
    }

    await ctx.db.patch(args.vehicleId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const adminListAllVehicles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vehicles").order("desc").collect();
  },
});

export const adminApproveVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    // Check seller's subscription limit before activating
    const sub = await ctx.db
      .query("dealerSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", vehicle.sellerId))
      .first();

    const listingLimit = sub ? sub.listingLimit : 1;

    const activeVehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_seller", (q) => q.eq("sellerId", vehicle.sellerId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const targetStatus = activeVehicles.length < listingLimit ? "active" : "inactive";

    await ctx.db.patch(args.vehicleId, {
      status: targetStatus,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: vehicle.sellerId,
      title: "Vehicle Approved! ✅",
      message: `Your listing "${vehicle.title}" was approved by Swahivo Admin and is now ${targetStatus === "active" ? "live in the marketplace" : "saved (capacity full)"}.`,
      type: "approval",
      link: `/cars/${vehicle.slug}`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true, status: targetStatus };
  },
});

export const adminRejectVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    adminUserId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    await ctx.db.patch(args.vehicleId, {
      status: "rejected",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: vehicle.sellerId,
      title: "Vehicle Listing Rejected",
      message: `Listing "${vehicle.title}" was not approved: ${args.reason}`,
      type: "approval",
      link: "/seller/dashboard/vehicles",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const toggleFeatured = mutation({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    await ctx.db.patch(args.vehicleId, {
      isFeatured: !vehicle.isFeatured,
    });
    return { isFeatured: !vehicle.isFeatured };
  },
});

export const incrementViewCount = mutation({
  args: {
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (vehicle) {
      await ctx.db.patch(args.vehicleId, {
        viewCount: vehicle.viewCount + 1,
      });
    }
  },
});
