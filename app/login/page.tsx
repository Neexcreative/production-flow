import type { Metadata } from "next";

import { LoginScreen } from "@/components/auth/LoginScreen";

export const metadata: Metadata = {
  title: "Login | Production Flow",
};

export default function LoginPage() {
  return <LoginScreen />;
}
