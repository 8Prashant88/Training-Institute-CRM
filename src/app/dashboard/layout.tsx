import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { countUnreadNotifications } from "@/services/notification-service";
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

  const initialUnreadCount = await countUnreadNotifications(currentUser.id);

  return (
    <DashboardShell
      currentUser={{
        fullName: currentUser.fullName,
        email: currentUser.email,
        role: currentUser.role,
      }}
      initialUnreadCount={initialUnreadCount}
    >
      {children}
    </DashboardShell>
  );
}