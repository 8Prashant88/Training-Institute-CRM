import Link from "next/link";
import { Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-panel)]">
        <div
          aria-hidden="true"
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        >
          <Compass className="size-6" />
        </div>

        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-red-600">
          404 error
        </p>

        <h1 className="mt-2 text-3xl font-bold text-primary-900">
          Page not found
        </h1>

        <p className="mt-3 text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Return home
          </Link>

          <Link href="/dashboard" className={buttonVariants()}>
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
