import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users & Auth
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // "admin" | "seller" | "buyer"
    phone: v.optional(v.string()),
    passwordHash: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.string(), // "active" | "suspended"
    createdAt: v.number(),
  }).index("by_email", ["email"]).index("by_role", ["role"]),

  // Dealership Profiles
  dealerProfiles: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    slug: v.string(),
    registrationNumber: v.optional(v.string()),
    tinNumber: v.optional(v.string()),
    location: v.string(), // e.g. "Dar es Salaam, Tanzania", "Zanzibar"
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    description: v.string(),
    rating: v.number(),
    reviewCount: v.number(),
    isVerified: v.boolean(),
    totalSales: v.number(),
    activeListingCount: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_slug", ["slug"]),

  // Dealer Applications
  dealerApplications: defineTable({
    userId: v.id("users"),
    applicantName: v.string(),
    businessName: v.string(),
    location: v.string(),
    phone: v.string(),
    email: v.string(),
    businessReg: v.optional(v.string()),
    description: v.string(),
    status: v.string(), // "pending" | "approved" | "rejected"
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_status", ["status"]).index("by_user", ["userId"]),

  // Vehicles
  vehicles: defineTable({
    title: v.string(),
    slug: v.string(),
    brand: v.string(),
    model: v.string(),
    variant: v.optional(v.string()),
    condition: v.string(), // "New" | "Used" | "Certified Pre-Owned"
    year: v.number(),
    mileage: v.number(), // in km
    fuelType: v.string(), // "Petrol" | "Diesel" | "Hybrid" | "Electric"
    transmission: v.string(), // "Automatic" | "Manual"
    engineCapacity: v.optional(v.string()), // e.g. "3.5L V6"
    priceTzs: v.number(),
    location: v.string(), // "Dar es Salaam" | "Arusha" | "Mwanza" | "Zanzibar" | "Dodoma"
    description: v.string(),
    features: v.array(v.string()),
    sellerId: v.id("users"),
    dealerId: v.optional(v.id("dealerProfiles")),
    status: v.string(), // "pending_approval" | "active" | "inactive" | "sold" | "archived" | "rejected"
    isFeatured: v.boolean(),
    viewCount: v.number(),
    enquiryCount: v.number(),
    images: v.array(v.string()), // URLs or storage IDs
    primaryImage: v.string(),
    optionalServices: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_seller", ["sellerId"])
    .index("by_brand", ["brand"])
    .index("by_featured", ["isFeatured", "status"])
    .index("by_slug", ["slug"]),

  // Brands
  vehicleBrands: defineTable({
    name: v.string(),
    slug: v.string(),
    logoUrl: v.string(),
    vehicleCount: v.number(),
    isPopular: v.boolean(),
  }).index("by_name", ["name"]),

  // Categories
  vehicleCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    image: v.string(),
    vehicleCount: v.number(),
  }).index("by_slug", ["slug"]),

  // Subscription Plans (6 Tiers)
  subscriptionPlans: defineTable({
    name: v.string(), // "Free" | "Starter" | "Growth" | "Professional" | "Business" | "Enterprise"
    slug: v.string(),
    priceMonthlyTzs: v.number(), // 0, 49000, 99000, 199000, 299000, 399000
    listingLimit: v.number(), // 1, 10, 30, 50, 100, 200
    photosPerVehicle: v.number(), // 5, 10, 15, 20, 25, 30
    description: v.string(),
    features: v.array(v.string()),
    isPopular: v.boolean(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  // Dealer Subscriptions
  dealerSubscriptions: defineTable({
    userId: v.id("users"),
    dealerId: v.optional(v.id("dealerProfiles")),
    planId: v.id("subscriptionPlans"),
    planName: v.string(),
    status: v.string(), // "active" | "past_due" | "canceled"
    listingLimit: v.number(),
    currentActiveListings: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    autoRenew: v.boolean(),
    lastPaymentId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  // Subscription Invoices
  subscriptionInvoices: defineTable({
    invoiceNumber: v.string(), // e.g. "INV-2026-001"
    userId: v.id("users"),
    dealerId: v.optional(v.id("dealerProfiles")),
    planId: v.id("subscriptionPlans"),
    planName: v.string(),
    amountTzs: v.number(),
    amountUsd: v.number(),
    currency: v.string(), // "TZS"
    status: v.string(), // "pending" | "paid" | "failed" | "canceled"
    dueDate: v.number(),
    paidAt: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_number", ["invoiceNumber"]),

  // Subscription Payments
  subscriptionPayments: defineTable({
    invoiceId: v.id("subscriptionInvoices"),
    userId: v.id("users"),
    amountTzs: v.number(),
    paymentMethod: v.string(), // "M-Pesa" | "Tigo Pesa" | "Airtel Money" | "Bank Transfer" | "Card"
    referenceCode: v.string(),
    phoneNumber: v.optional(v.string()),
    status: v.string(), // "pending_verification" | "verified" | "rejected"
    submittedAt: v.number(),
    verifiedBy: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
  }).index("by_invoice", ["invoiceId"]).index("by_user", ["userId"]).index("by_status", ["status"]),

  // Buyer Enquiries
  enquiries: defineTable({
    vehicleId: v.id("vehicles"),
    vehicleTitle: v.string(),
    sellerId: v.id("users"),
    buyerId: v.optional(v.id("users")),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    message: v.string(),
    status: v.string(), // "new" | "contacted" | "responded" | "pending" | "closed"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_seller", ["sellerId"]).index("by_buyer", ["buyerId"]).index("by_vehicle", ["vehicleId"]),

  // Enquiry Messages / Chat Thread
  enquiryMessages: defineTable({
    enquiryId: v.id("enquiries"),
    senderId: v.id("users"),
    senderName: v.string(),
    senderRole: v.string(), // "buyer" | "seller" | "admin"
    message: v.string(),
    createdAt: v.number(),
  }).index("by_enquiry", ["enquiryId"]),

  // Test Drive & Inspection Bookings
  bookings: defineTable({
    vehicleId: v.id("vehicles"),
    vehicleTitle: v.string(),
    sellerId: v.id("users"),
    buyerId: v.optional(v.id("users")),
    buyerName: v.string(),
    buyerPhone: v.string(),
    buyerEmail: v.string(),
    bookingType: v.string(), // "test_drive" | "inspection" | "service"
    scheduledDate: v.string(), // "YYYY-MM-DD"
    scheduledTime: v.string(), // "10:00 AM"
    status: v.string(), // "pending" | "confirmed" | "completed" | "canceled"
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_seller", ["sellerId"]).index("by_buyer", ["buyerId"]),

  // Orders / Reservations
  orders: defineTable({
    orderNumber: v.string(), // e.g. "#1001"
    vehicleId: v.id("vehicles"),
    vehicleTitle: v.string(),
    sellerId: v.id("users"),
    buyerId: v.optional(v.id("users")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    deliveryLocation: v.string(),
    amountTzs: v.number(),
    status: v.string(), // "pending" | "payment_processing" | "completed" | "canceled"
    paymentMethod: v.string(),
    dateStr: v.string(),
    createdAt: v.number(),
  }).index("by_seller", ["sellerId"]).index("by_buyer", ["buyerId"]).index("by_order_number", ["orderNumber"]),

  // Saved / Favorite Vehicles
  favorites: defineTable({
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    createdAt: v.number(),
  }).index("by_user_vehicle", ["userId", "vehicleId"]).index("by_user", ["userId"]),

  // Customer Reviews
  reviews: defineTable({
    authorName: v.string(),
    authorLocation: v.string(),
    authorAvatar: v.string(),
    rating: v.number(),
    comment: v.string(),
    isVerifiedPurchase: v.boolean(),
    status: v.string(), // "approved" | "pending"
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Accessories Marketplace
  accessories: defineTable({
    title: v.string(),
    category: v.string(),
    priceTzs: v.number(),
    condition: v.string(), // "New" | "Used"
    image: v.string(),
    sellerId: v.id("users"),
    stock: v.number(),
    description: v.string(),
    status: v.string(),
    createdAt: v.number(),
  }).index("by_category", ["category"]),

  // Dealership Services
  services: defineTable({
    title: v.string(),
    description: v.string(),
    priceEstimateTzs: v.number(),
    category: v.string(), // "Maintenance" | "Financing" | "Insurance" | "Inspection"
    icon: v.string(),
    contactPhone: v.string(),
  }),

  // Financing Applications
  financingApplications: defineTable({
    applicantName: v.string(),
    applicantPhone: v.string(),
    applicantEmail: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    vehicleTitle: v.optional(v.string()),
    monthlyIncomeTzs: v.number(),
    downPaymentTzs: v.number(),
    employmentType: v.string(), // "Employed" | "Business Owner" | "Self-Employed"
    requestedLoanAmountTzs: v.number(),
    preferredTenureMonths: v.number(),
    status: v.string(), // "pending" | "under_review" | "approved" | "declined"
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Promoted Listings & Ads
  promotedListings: defineTable({
    vehicleId: v.id("vehicles"),
    vehicleTitle: v.string(),
    dealerId: v.id("users"),
    placement: v.string(), // "homepage_hero" | "top_search" | "category_featured"
    priceTzs: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.string(), // "pending_approval" | "active" | "expired"
    paymentStatus: v.string(), // "pending" | "paid"
    impressions: v.number(),
    clicks: v.number(),
    createdAt: v.number(),
  }).index("by_dealer", ["dealerId"]).index("by_status", ["status"]),

  // Exchange Rates
  exchangeRates: defineTable({
    baseCurrency: v.string(), // "TZS"
    quoteCurrency: v.string(), // "USD"
    rate: v.number(), // 1 TZS = 0.000385 USD (approx 2,600 TZS per USD)
    updatedAt: v.number(),
    source: v.string(),
  }).index("by_pair", ["baseCurrency", "quoteCurrency"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "enquiry" | "booking" | "order" | "subscription" | "system"
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId", "isRead"]),

  // Audit Logs
  auditLogs: defineTable({
    action: v.string(),
    performedBy: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    details: v.string(),
    timestamp: v.number(),
  }),

  // Newsletter Subscriptions
  newsletterSubscriptions: defineTable({
    email: v.string(),
    status: v.string(), // "active" | "unsubscribed"
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
