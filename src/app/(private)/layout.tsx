import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireManager } from "@/lib/auth";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireManager();

  return (
    <div className="min-h-dvh bg-slate-50 lg:flex">
      <AppHeader managerName={profile.full_name} />
      <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
