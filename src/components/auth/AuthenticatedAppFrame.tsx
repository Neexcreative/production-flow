"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ProductionTrackerProvider } from "@/components/orders/ProductionTrackerProvider";

export function AuthenticatedAppFrame({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <ProductionTrackerProvider>
      <AppShell>{children}</AppShell>
    </ProductionTrackerProvider>
  );
}
