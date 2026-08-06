import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const currentUser =
    await getCurrentAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <DashboardShell
      currentUser={{
        fullName: currentUser.fullName,
        email: currentUser.email,
        role: currentUser.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}