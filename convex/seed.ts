import { mutation } from "./_generated/server";
import { hashPassword } from "./authHelper";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Seed Subscription Plans (6 Tiers)
    const existingPlans = await ctx.db.query("subscriptionPlans").collect();
    if (existingPlans.length === 0) {
      const plans = [
        {
          name: "Free",
          slug: "free",
          priceMonthlyTzs: 0,
          listingLimit: 1,
          photosPerVehicle: 5,
          description: "Essential tools for private sellers and new dealerships testing Swahivo.",
          features: [
            "1 active vehicle listing",
            "5 photos per vehicle",
            "Basic dealer dashboard",
            "Basic buyer enquiries",
            "Edit and manage listing",
            "Standard search inclusion",
            "No monthly subscription charge",
          ],
          isPopular: false,
          isActive: true,
          sortOrder: 1,
        },
        {
          name: "Starter",
          slug: "starter",
          priceMonthlyTzs: 49000,
          listingLimit: 10,
          photosPerVehicle: 10,
          description: "Designed for small boutique car yards and growing independent auto dealers.",
          features: [
            "10 active vehicle listings",
            "10 photos per vehicle",
            "Buyer enquiry management",
            "Basic inventory analytics",
            "Direct WhatsApp enquiry lead button",
            "Standard priority support",
          ],
          isPopular: false,
          isActive: true,
          sortOrder: 2,
        },
        {
          name: "Growth",
          slug: "growth",
          priceMonthlyTzs: 99000,
          listingLimit: 30,
          photosPerVehicle: 15,
          description: "Ideal for established multi-car showrooms looking for higher conversion.",
          features: [
            "30 active vehicle listings",
            "15 photos per vehicle",
            "Dealer CRM & lead tracking",
            "Featured listing promotional tools",
            "Inventory aging statistics",
            "Vehicle valuation estimates",
            "Priority support",
          ],
          isPopular: true,
          isActive: true,
          sortOrder: 3,
        },
        {
          name: "Professional",
          slug: "professional",
          priceMonthlyTzs: 199000,
          listingLimit: 50,
          photosPerVehicle: 20,
          description: "High-volume dealerships requiring deep analytics and lead pipeline management.",
          features: [
            "50 active vehicle listings",
            "20 photos per vehicle",
            "Advanced sales & view reporting",
            "Vehicle market valuation index",
            "Customer lead CRM pipeline",
            "Featured badge on dealer directory",
            "Dedicated phone & WhatsApp support",
          ],
          isPopular: false,
          isActive: true,
          sortOrder: 4,
        },
        {
          name: "Business",
          slug: "business",
          priceMonthlyTzs: 299000,
          listingLimit: 100,
          photosPerVehicle: 25,
          description: "Premier dealership chains needing team access and AI inventory tools.",
          features: [
            "100 active vehicle listings",
            "25 photos per vehicle",
            "AI inventory insights & market pricing",
            "Multi-staff dealer access & roles",
            "Advanced sales conversion analytics",
            "Integrated promotion management",
            "Custom showroom profile banner",
          ],
          isPopular: false,
          isActive: true,
          sortOrder: 5,
        },
        {
          name: "Enterprise",
          slug: "enterprise",
          priceMonthlyTzs: 399000,
          listingLimit: 200,
          photosPerVehicle: 30,
          description: "Flagship automotive groups, importers, and official franchise distributors.",
          features: [
            "200 active vehicle listings",
            "30 photos per vehicle",
            "Complete enterprise dealership analytics",
            "AI Assistant for vehicle descriptions & pricing",
            "Vehicle sourcing & demand analytics",
            "Advanced enterprise CRM & order workflow",
            "Multi-staff custom roles & permissions",
            "Highest-tier dedicated account manager",
          ],
          isPopular: false,
          isActive: true,
          sortOrder: 6,
        },
      ];

      for (const p of plans) {
        await ctx.db.insert("subscriptionPlans", p);
      }
    }

    // 2. Seed Users & Profiles
    let admin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@swahivo.com"))
      .first();

    if (!admin) {
      const pass = await hashPassword("admin123");
      const adminId = await ctx.db.insert("users", {
        name: "Swahivo Admin",
        email: "admin@swahivo.com",
        passwordHash: pass,
        role: "admin",
        phone: "+255 770 565 656",
        avatarUrl: "/assets/aistudio/logo_52dfade8.png",
        status: "active",
        createdAt: Date.now(),
      });
      admin = await ctx.db.get(adminId);
    }

    let seller = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "ali.hassan@swahivo.com"))
      .first();

    let sellerId = seller?._id;
    if (!seller) {
      const pass = await hashPassword("ali123");
      sellerId = await ctx.db.insert("users", {
        name: "Ali Hassan",
        email: "ali.hassan@swahivo.com",
        passwordHash: pass,
        role: "seller",
        phone: "+255 770 123 456",
        avatarUrl: "/assets/aistudio/logo_52dfade8.png",
        status: "active",
        createdAt: Date.now(),
      });
      seller = await ctx.db.get(sellerId);
    }

    let buyer = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "salim.khamis@example.com"))
      .first();

    let buyerId = buyer?._id;
    if (!buyer) {
      const pass = await hashPassword("buyer123");
      buyerId = await ctx.db.insert("users", {
        name: "Salim Khamis",
        email: "salim.khamis@example.com",
        passwordHash: pass,
        role: "buyer",
        phone: "+255 771 234 567",
        avatarUrl: "/assets/aistudio/logo_52dfade8.png",
        status: "active",
        createdAt: Date.now(),
      });
      buyer = await ctx.db.get(buyerId);
    }

    // Dealer Profile for Ali Hassan
    let dealerProfile = await ctx.db
      .query("dealerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", sellerId!))
      .first();

    if (!dealerProfile) {
      const dpId = await ctx.db.insert("dealerProfiles", {
        userId: sellerId!,
        businessName: "Swahivo Premier Motors",
        slug: "swahivo-premier-motors",
        registrationNumber: "BRELA-TZ-884920",
        tinNumber: "139-448-902",
        location: "Kiembe Samaki, Zanzibar & Dar es Salaam",
        address: "Plot 42, Airport Road, Zanzibar",
        phone: "+255 770 565 656",
        email: "auto.link@yahoo.com",
        logoUrl: "/assets/aistudio/logo_52dfade8.png",
        bannerUrl: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
        description: "Official authorized multi-brand car dealership with direct Japanese, European and UAE vehicle imports, full TRA registration, warranty and financing options.",
        rating: 4.9,
        reviewCount: 38,
        isVerified: true,
        totalSales: 32,
        activeListingCount: 12,
        createdAt: Date.now(),
      });
      dealerProfile = await ctx.db.get(dpId);

      // Assign Starter or Growth plan to Ali Hassan
      const growthPlan = await ctx.db
        .query("subscriptionPlans")
        .withIndex("by_slug", (q) => q.eq("slug", "growth"))
        .first();

      if (growthPlan) {
        await ctx.db.insert("dealerSubscriptions", {
          userId: sellerId!,
          dealerId: dpId,
          planId: growthPlan._id,
          planName: growthPlan.name,
          status: "active",
          listingLimit: growthPlan.listingLimit,
          currentActiveListings: 6,
          startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
          endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
          autoRenew: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    // 3. Vehicles
    const existingVehicles = await ctx.db.query("vehicles").collect();
    if (existingVehicles.length === 0) {
      const sampleVehicles = [
        {
          title: "Toyota Land Cruiser 300 VXR",
          slug: "toyota-land-cruiser-300-vxr",
          brand: "Toyota",
          model: "Land Cruiser",
          variant: "300 VXR Twin Turbo",
          condition: "Used",
          year: 2023,
          mileage: 12000,
          fuelType: "Diesel",
          transmission: "Automatic",
          engineCapacity: "3.3L Twin Turbo V6",
          priceTzs: 76500000,
          location: "Dar es Salaam",
          description: "Pristine condition 2023 Toyota Land Cruiser 300 Series VXR with full leather interior, 360-degree camera, sunroof, heated seats, and clean TRA documentation.",
          features: ["Full TRA Documentation", "Leather Interior", "Sunroof", "360 Camera", "Keyless Entry", "Adaptive Cruise Control", "Apple CarPlay"],
          images: [
            "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
            "/assets/aistudio/Swahivo_Car_Dealership_Homepage_4d85edbe.png",
          ],
          primaryImage: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          isFeatured: true,
          viewCount: 1245,
          enquiryCount: 35,
          status: "active",
        },
        {
          title: "BMW 3 Series 330i M-Sport",
          slug: "bmw-3-series-330i-m-sport",
          brand: "BMW",
          model: "3 Series",
          variant: "330i M Sport Package",
          condition: "Used",
          year: 2022,
          mileage: 18000,
          fuelType: "Petrol",
          transmission: "Automatic",
          engineCapacity: "2.0L Turbocharged",
          priceTzs: 45000000,
          location: "Dar es Salaam",
          description: "Striking red BMW 3 Series M-Sport with red-accented sports package, paddle shifters, digital cockpit, ambient lighting, and dealer warranty.",
          features: ["M-Sport Aerodynamics", "Harman Kardon Audio", "Digital Cockpit", "Paddle Shifters", "Dealer Warranty", "Sport Exhaust"],
          images: [
            "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          ],
          primaryImage: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          isFeatured: true,
          viewCount: 980,
          enquiryCount: 28,
          status: "active",
        },
        {
          title: "Honda Civic Touring Sedan",
          slug: "honda-civic-touring-sedan",
          brand: "Honda",
          model: "Civic",
          variant: "Touring Edition",
          condition: "Used",
          year: 2021,
          mileage: 24000,
          fuelType: "Petrol",
          transmission: "Automatic",
          engineCapacity: "1.5L Turbo VTEC",
          priceTzs: 28500000,
          location: "Arusha",
          description: "Well-maintained silver Honda Civic Touring sedan offering exceptional fuel efficiency, spacious cabin, lane assist, and low running costs in Tanzania.",
          features: ["Honda Sensing Suite", "Lane Keep Assist", "Rear Camera", "Heated Seats", "Alloy Wheels", "Bluetooth"],
          images: [
            "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          ],
          primaryImage: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          isFeatured: true,
          viewCount: 620,
          enquiryCount: 12,
          status: "active",
        },
        {
          title: "Ford Ranger Wildtrak 4x4",
          slug: "ford-ranger-wildtrak-4x4",
          brand: "Ford",
          model: "Ranger",
          variant: "Wildtrak 4WD Double Cab",
          condition: "Used",
          year: 2023,
          mileage: 15000,
          fuelType: "Diesel",
          transmission: "Automatic",
          engineCapacity: "2.0L Bi-Turbo Diesel",
          priceTzs: 42000000,
          location: "Mwanza",
          description: "Tough and capable Ford Ranger Wildtrak 4x4 pickup. Perfect for safari adventures, business logistics, and long-distance African terrains.",
          features: ["4x4 Terrain Management", "Tow Bar", "Roof Rails", "Rear Bed Liner", "Reverse Camera", "Touchscreen Navigation"],
          images: [
            "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          ],
          primaryImage: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          isFeatured: true,
          viewCount: 750,
          enquiryCount: 18,
          status: "active",
        },
        {
          title: "Toyota RAV4 Limited Hybrid AWD",
          slug: "toyota-rav4-limited-hybrid-awd",
          brand: "Toyota",
          model: "RAV4",
          variant: "Limited Hybrid AWD",
          condition: "Used",
          year: 2022,
          mileage: 20000,
          fuelType: "Hybrid",
          transmission: "Automatic",
          engineCapacity: "2.5L Hybrid e-CVT",
          priceTzs: 38800000,
          location: "Zanzibar",
          description: "Eco-friendly, ultra-reliable Toyota RAV4 Hybrid with intelligent All-Wheel Drive, high ground clearance, and premium audio system.",
          features: ["Hybrid Synergy Drive", "AWD", "Sunroof", "Smart Key", "Dual Climate Control", "LED Headlights"],
          images: [
            "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          ],
          primaryImage: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          isFeatured: true,
          viewCount: 540,
          enquiryCount: 10,
          status: "active",
        },
        {
          title: "Mercedes-Benz C-Class C200 AMG Line",
          slug: "mercedes-benz-c-class-c200-amg-line",
          brand: "Mercedes-Benz",
          model: "C-Class",
          variant: "C200 AMG Line Night Edition",
          condition: "Used",
          year: 2022,
          mileage: 16000,
          fuelType: "Petrol",
          transmission: "Automatic",
          engineCapacity: "1.5L Turbo Mild Hybrid",
          priceTzs: 68000000,
          location: "Dar es Salaam",
          description: "Luxury executive saloon with obsidian black finish, AMG interior styling, MBUX infotainment, and panoramic glass roof.",
          features: ["AMG Line Styling", "Panoramic Sunroof", "MBUX Touchscreen", "Burmester Sound", "Ambient Lighting 64-colors"],
          images: [
            "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          ],
          primaryImage: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png",
          isFeatured: true,
          viewCount: 890,
          enquiryCount: 22,
          status: "active",
        },
      ];

      for (const vData of sampleVehicles) {
        await ctx.db.insert("vehicles", {
          ...vData,
          sellerId: sellerId!,
          dealerId: dealerProfile?._id,
          createdAt: Date.now() - Math.floor(Math.random() * 10 * 86400000),
          updatedAt: Date.now(),
        });
      }
    }

    // 4. Seed Categories
    const existingCats = await ctx.db.query("vehicleCategories").collect();
    if (existingCats.length === 0) {
      const cats = [
        { name: "New Cars", slug: "new-cars", icon: "Sparkles", image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png", vehicleCount: 82 },
        { name: "Used Cars", slug: "used-cars", icon: "Car", image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png", vehicleCount: 96 },
        { name: "Accessories", slug: "accessories", icon: "Wrench", image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png", vehicleCount: 24 },
        { name: "Motorbikes", slug: "motorbikes", icon: "Bike", image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png", vehicleCount: 18 },
        { name: "Electric & Hybrid", slug: "electric", icon: "Zap", image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png", vehicleCount: 16 },
        { name: "Commercial & Trucks", slug: "commercial", icon: "Truck", image: "/assets/aistudio/Swahivo_Dealership_at_Sunset_e85cb77e.png", vehicleCount: 10 },
      ];
      for (const c of cats) {
        await ctx.db.insert("vehicleCategories", c);
      }
    }

    // 5. Seed Brands
    const existingBrands = await ctx.db.query("vehicleBrands").collect();
    if (existingBrands.length === 0) {
      const brands = [
        { name: "Toyota", slug: "toyota", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 92, isPopular: true },
        { name: "BMW", slug: "bmw", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 48, isPopular: true },
        { name: "Mercedes-Benz", slug: "mercedes-benz", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 36, isPopular: true },
        { name: "Ford", slug: "ford", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 28, isPopular: true },
        { name: "Honda", slug: "honda", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 24, isPopular: true },
        { name: "Land Rover", slug: "land-rover", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 15, isPopular: false },
        { name: "Nissan", slug: "nissan", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 20, isPopular: false },
        { name: "Mitsubishi", slug: "mitsubishi", logoUrl: "/assets/aistudio/logo_52dfade8.png", vehicleCount: 14, isPopular: false },
      ];
      for (const b of brands) {
        await ctx.db.insert("vehicleBrands", b);
      }
    }

    // 6. Seed Customer Reviews
    const existingReviews = await ctx.db.query("reviews").collect();
    if (existingReviews.length === 0) {
      const reviews = [
        {
          authorName: "Ahmed S.",
          authorLocation: "Dar es Salaam",
          authorAvatar: "/assets/aistudio/logo_52dfade8.png",
          rating: 5,
          comment: "Amazing service and genuine cars. Swahivo made the whole buying process so easy! Registration and inspection were handled seamlessly.",
          isVerifiedPurchase: true,
          status: "approved",
          createdAt: Date.now() - 3 * 86400000,
        },
        {
          authorName: "Fatma A.",
          authorLocation: "Zanzibar",
          authorAvatar: "/assets/aistudio/logo_52dfade8.png",
          rating: 5,
          comment: "I got my dream car with flexible payments. Highly recommend Swahivo to anyone looking for trusted auto dealers in East Africa!",
          isVerifiedPurchase: true,
          status: "approved",
          createdAt: Date.now() - 5 * 86400000,
        },
        {
          authorName: "Juma M.",
          authorLocation: "Arusha",
          authorAvatar: "/assets/aistudio/logo_52dfade8.png",
          rating: 5,
          comment: "Professional, transparent, and trustworthy. The best car dealership marketplace in Tanzania with verified listings.",
          isVerifiedPurchase: true,
          status: "approved",
          createdAt: Date.now() - 8 * 86400000,
        },
      ];
      for (const r of reviews) {
        await ctx.db.insert("reviews", r);
      }
    }

    // 7. Seed Exchange Rate
    const existingRate = await ctx.db
      .query("exchangeRates")
      .withIndex("by_pair", (q) => q.eq("baseCurrency", "TZS").eq("quoteCurrency", "USD"))
      .first();

    if (!existingRate) {
      await ctx.db.insert("exchangeRates", {
        baseCurrency: "TZS",
        quoteCurrency: "USD",
        rate: 0.000385,
        source: "Bank of Tanzania (BOT) Interbank Reference",
        updatedAt: Date.now(),
      });
    }

    return { success: true, message: "Database successfully seeded with Swahivo live platform data." };
  },
});
