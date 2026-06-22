import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { ProductionTrackerProvider } from "@/components/orders/ProductionTrackerProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Production Flow",
  description: "Internal job and production control system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ProductionTrackerProvider>
          <AppShell>{children}</AppShell>
        </ProductionTrackerProvider>
      </body>
    </html>
  );
}
