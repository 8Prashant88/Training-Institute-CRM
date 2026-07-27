import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Day 1
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Training Institute CRM
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          A lead and enrollment management system for training institutes.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="font-medium text-slate-900">Current milestone</p>
          <p className="mt-1 text-slate-600">
            Project foundation, product planning, and Git workflow.
          </p>
        </div>
      </section>
    </main>
  );
}