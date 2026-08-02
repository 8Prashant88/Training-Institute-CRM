const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

export function formatDate(isoDate: string) {
  return dateFormatter.format(new Date(isoDate));
}

export function formatRelativeDate(isoDate: string, now = new Date()) {
  const target = new Date(isoDate);
  const diffSeconds = Math.round(
    (target.getTime() - now.getTime()) / 1000,
  );

  const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return relativeFormatter.format(
        Math.round(diffSeconds / secondsInUnit),
        unit,
      );
    }
  }

  return relativeFormatter.format(diffSeconds, "second");
}

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}
