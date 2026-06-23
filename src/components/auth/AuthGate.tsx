"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isSupabaseAvailable, session } = useAuth();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoading || !isSupabaseAvailable) {
      return;
    }

    if (!session && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (session && isLoginPage) {
      router.replace("/");
    }
  }, [isLoading, isLoginPage, isSupabaseAvailable, router, session]);

  if (!isSupabaseAvailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_24%,#eef2f7_100%)] px-6">
        <section className="w-full max-w-lg rounded-2xl border border-amber-300 bg-white p-8 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Supabase Setup Required
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Authentication is unavailable
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
            to enable login and protected access.
          </p>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_24%,#eef2f7_100%)] px-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)]">
          <p className="text-sm font-semibold text-slate-600">
            Checking secure session...
          </p>
        </section>
      </main>
    );
  }

  if (!session && !isLoginPage) {
    return null;
  }

  if (session && isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
