export function formatNaira(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

export function formatNairaFull(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getProgressPercent(raised: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((raised / target) * 100), 100);
}

export function getRiskColor(rating: string): string {
  switch (rating.toLowerCase()) {
    case "low":
      return "text-emerald-600 dark:text-emerald-400";
    case "moderate":
      return "text-amber-600 dark:text-amber-400";
    case "high":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

export function getRiskBg(rating: string): string {
  switch (rating.toLowerCase()) {
    case "low":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    case "moderate":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "high":
      return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    completed_rental: "Completed Rental",
    off_plan: "Off-Plan",
    mixed_use: "Mixed-Use",
    commercial: "Commercial",
    student_housing: "Student Housing",
    affordable_housing: "Affordable Housing",
    hospitality: "Hospitality",
    industrial: "Industrial",
    healthcare: "Healthcare",
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "funding":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "funded":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "published":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "paused":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "completed":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function cn(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(" ");
}
