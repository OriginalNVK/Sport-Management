export function formatVnd(amount: number) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${(amount ?? 0).toLocaleString("vi-VN")} ₫`;
  }
}

export function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6", "#a855f7", "#f97316"];
export function pickColor(index: number) {
  return COLORS[index % COLORS.length];
}
