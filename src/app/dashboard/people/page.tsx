import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, UserCog, Users } from "lucide-react";

import { CardEyebrow } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { isAdmin } from "@/lib/authorization";
import PeopleManager from "@/components/people/PeopleManager";
import { listPeople } from "@/services/people-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

export const metadata: Metadata = {
  title: "People",
};

export default async function PeoplePage() {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser || !isAdmin(currentUser)) {
    redirect("/dashboard");
  }

  const rawPeople = await listPeople();
  const people = rawPeople.map((person) => ({
    ...person,
    createdAt: person.createdAt.toISOString(),
  }));

  const activeCount = people.filter((person) => person.isActive).length;
  const adminCount = people.filter((person) => person.role === "ADMIN").length;
  const counselorCount = people.filter(
    (person) => person.role === "COUNSELOR",
  ).length;

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Team management</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          People
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Add administrators and counselors, review who has dashboard access,
          and manage roles for everyone on your team.
        </p>
      </section>

      <section aria-label="People statistics" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total people"
          value={people.length}
          icon={Users}
          description={`${activeCount} active`}
        />

        <StatCard
          label="Administrators"
          value={adminCount}
          icon={ShieldCheck}
          description="Full access to the CRM"
        />

        <StatCard
          label="Counselors"
          value={counselorCount}
          icon={UserCog}
          description="Manage assigned leads"
        />
      </section>

      <PeopleManager people={people} currentUserId={currentUser.id} />
    </div>
  );
}
