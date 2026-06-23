import type { Metadata } from "next";

import { AuthenticatedAppFrame } from "@/components/auth/AuthenticatedAppFrame";
import { AuthGate } from "@/components/auth/AuthGate";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
        <AuthProvider>
          <AuthGate>
            <AuthenticatedAppFrame>{children}</AuthenticatedAppFrame>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
