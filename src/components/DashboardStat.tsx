type DashboardStatProps = {
  label: string;
  value: number;
};

export default function DashboardStat({
  label,
  value,
}: DashboardStatProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-600">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}