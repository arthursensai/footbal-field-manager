import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireManager } from "@/lib/auth";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireManager();
  return (
    <div className="min-h-dvh">
      <AppHeader managerName={profile.full_name} />
      <main className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-6">{children}</main>
    </div>
  );
}
