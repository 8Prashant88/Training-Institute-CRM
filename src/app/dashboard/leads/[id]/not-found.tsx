import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";

export default function LeadNotFound() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <div
        aria-hidden="true"
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"
      >
        <SearchX className="size-6" />
      </div>

      <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        404 error
      </p>

      <h1 className="mt-2 text-3xl font-bold text-primary-900">
        Lead not found
      </h1>

      <p className="mt-2 text-slate-600">
        The requested lead does not exist or may have been removed.
      </p>

      <Link
        href="/dashboard/leads"
        className={buttonVariants({ className: "mt-6" })}
      >
        Return to leads
      </Link>
    </section>
  );
}
