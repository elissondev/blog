import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleLanguage } from "@/lib/locales";

export function Pagination({
  page,
  totalPages,
  searchParams,
  language = "pt-BR",
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  language?: ArticleLanguage;
}) {
  if (totalPages <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams))
      if (v && k !== "page") params.set(k, v);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  const labels =
    language === "en"
      ? {
          nav: "Article pagination",
          previous: "Previous page",
          next: "Next page",
        }
      : language === "es"
        ? {
            nav: "Paginación de artículos",
            previous: "Página anterior",
            next: "Página siguiente",
          }
        : {
            nav: "Paginação de artigos",
            previous: "Página anterior",
            next: "Próxima página",
          };

  return (
    <nav
      aria-label={labels.nav}
      className="mt-10 flex items-center justify-center gap-1"
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          className="flex size-9 items-center justify-center rounded-md border hover:bg-accent"
          aria-label={labels.previous}
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-md border text-sm font-medium",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link
          href={href(page + 1)}
          rel="next"
          className="flex size-9 items-center justify-center rounded-md border hover:bg-accent"
          aria-label={labels.next}
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
