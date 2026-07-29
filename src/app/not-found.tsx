import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
          404 error
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Page not found
        </h1>

        <p className="mt-3 text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Return home
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}