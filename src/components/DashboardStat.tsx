type DashboardStatProps = {
  label: string;
  value: number;
  description?: string;
};

export default function DashboardStat({
  label,
  value,
  description,
}: DashboardStatProps) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-1 w-12 rounded-full bg-[#F9901C]" />

      <p className="mt-4 text-sm font-medium text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-[#001B31]">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </article>
  );
}