import type { Metadata } from "next";

import { ReportsScreen } from "@/components/orders/ReportsScreen";

export const metadata: Metadata = {
  title: "Reports | Production Flow",
};

export default function ReportsPage() {
  return <ReportsScreen />;
}
