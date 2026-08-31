import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ProfileForm from "@/components/dashboard/ProfileForm";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function ProfilePage() {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          My profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          View your account details and update your profile photo.
        </p>
      </div>

      <ProfileForm
        currentUser={{
          fullName: currentUser.fullName,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          role: currentUser.role,
        }}
      />
    </div>
  );
}
