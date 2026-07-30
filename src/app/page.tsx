import LeadManager from "@/components/LeadManager";
import { initialLeads } from "@/data/initial-leads";
import { getServerConfigSummary } from "@/lib/server-config";

export default function HomePage() {
  const configSummary = getServerConfigSummary();
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 p-3 sm:p-6">
      <section className="mx-auto w-full min-w-0 max-w-4xl overflow-hidden rounded-2xl bg-white p-4 shadow-sm sm:p-8 lg:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Day 4
        </p>

        <h1 className="break-words text-2xl font-bold tracking-tight text-[#001B31] sm:text-4xl">
          Training Institute CRM
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-4 sm:text-lg sm:leading-8">
          Server-rendered CRM page with client-side lead management.
        </p>
        <div className="mt-6 min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Server configuration
          </p>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Region</dt>
              <dd className="font-medium text-slate-900">
                {configSummary.region}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">Internal API key</dt>
              <dd className="font-medium text-slate-900">
                {configSummary.internalApiKeyConfigured
                  ? "Configured"
                  : "Missing"}
              </dd>
            </div>
          </dl>
        </div>

        <LeadManager initialLeads={initialLeads} />
      </section>
    </main>
  );
}
