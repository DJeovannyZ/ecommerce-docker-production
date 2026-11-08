import { storeConfig } from "@/lib/config";

const currencyFormatter = new Intl.NumberFormat(storeConfig.locale, {
  style: "currency",
  currency: storeConfig.currency,
});

const dateFormatter = new Intl.DateTimeFormat(storeConfig.dateLocale, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Sin fecha" : dateFormatter.format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(storeConfig.locale).format(value);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function stockLabel(stock: number): string {
  if (stock <= 0) {
    return "Agotado";
  }

  if (stock <= 5) {
    return `Ultimas ${stock} unidades`;
  }

  return `${formatNumber(stock)} disponibles`;
}
