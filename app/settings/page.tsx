import type { Metadata } from "next";

import { SettingsScreen } from "@/components/orders/SettingsScreen";

export const metadata: Metadata = {
  title: "Settings | Production Flow",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
