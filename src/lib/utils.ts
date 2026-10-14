import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function authorSlug(name: string): string {
  return slugify(authorDisplayName(name));
}

export function authorFilterSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function authorDisplayName(name: string): string {
  return name.trim().toLowerCase() === "elisson.kario" ? "Élisson Kario" : name;
}

export function canonicalPageUrl(
  pathname: string,
  searchParams: Record<string, string | undefined>,
): string {
  const page = Number(searchParams.page);
  return Number.isInteger(page) && page > 1
    ? `${pathname}?page=${page}`
    : pathname;
}

export function readingTime(md: string): number {
  const words = md
    .replace(/[#*_`>[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
