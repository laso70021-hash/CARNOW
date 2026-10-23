import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Swahivo Cars - Dealership SaaS & Marketplace",
  description:
    "Multi-vendor automotive marketplace and dealership SaaS for Tanzania and Zanzibar with live inventory, buyer/seller dashboards, enquiries, bookings, and subscription plans.",
  openGraph: {
    title: "Swahivo Cars - Dealership SaaS & Marketplace",
    description:
      "Multi-vendor automotive marketplace and dealership SaaS for Tanzania and Zanzibar with live inventory, buyer/seller dashboards, enquiries, bookings, and subscription plans.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swahivo Cars - Dealership SaaS & Marketplace",
    description:
      "Multi-vendor automotive marketplace and dealership SaaS for Tanzania and Zanzibar with live inventory, buyer/seller dashboards, enquiries, bookings, and subscription plans.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-red-500 selection:text-white" suppressHydrationWarning>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
