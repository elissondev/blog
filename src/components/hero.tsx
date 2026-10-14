import {
  BadgeCheck,
  BookOpen,
  Calculator,
  TableProperties,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ExpandableText } from "./expandable-text";

export function Hero({
  title = "Nutrição com ciência e excelência",
  description = "Sou Élisson Kario. Compartilho estudos, pesquisas e artigos para aproximar a ciência da alimentação do dia a dia e do estilo de vida saudável.",
  compact = false,
  showActions = !compact,
  activeAction = compact ? undefined : "articles",
  avatarUrl,
  badgeText = "Estudante de Nutrição · Divulgação científica",
  expandableDescription = false,
}: {
  title?: string;
  description?: string | null;
  compact?: boolean;
  showActions?: boolean;
  activeAction?: "articles" | "calculators" | "tables";
  avatarUrl?: string | null;
  badgeText?: string | null;
  expandableDescription?: boolean;
}) {
  const spacing = compact ? "py-7 sm:py-8" : "py-10 sm:py-12";
  const titleSize = compact ? "text-2xl sm:text-4xl" : "text-3xl sm:text-5xl";
  const titleSpacing = compact ? "mt-0" : "mt-4";
  const actionClass = (active: boolean) =>
    `inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
      active
        ? "bg-white text-emerald-900 hover:bg-emerald-50"
        : "border border-white/60 text-white hover:bg-white/15"
    }`;

  return (
    <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-700 to-green-600">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[22px_22px]"
          aria-hidden
        />
        <div
          className={`relative mx-auto max-w-5xl px-6 text-center sm:px-8 ${spacing}`}
        >
          {!compact && badgeText && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <BadgeCheck className="size-4" /> {badgeText}
            </span>
          )}
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt={`Foto de ${title}`}
              width={96}
              height={96}
              className="mx-auto mt-5 size-24 rounded-full border-4 border-white/70 object-cover shadow-lg"
            />
          )}
          <h1
            className={`mx-auto ${titleSpacing} max-w-4xl font-bold leading-tight text-white ${titleSize}`}
          >
            {title}
          </h1>
          {expandableDescription && description ? (
            <ExpandableText
              text={description}
              className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg"
            />
          ) : (
            <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
              {description}
            </p>
          )}
          {showActions && (
            <nav
              aria-label="Explorar conteúdos e ferramentas"
              className="mt-7 flex flex-wrap justify-center gap-3"
            >
              <a
                href={compact ? "/#artigos" : "#artigos"}
                aria-current={activeAction === "articles" ? "page" : undefined}
                className={actionClass(activeAction === "articles")}
              >
                <BookOpen aria-hidden="true" className="size-4" />
                Artigos
              </a>
              <Link
                href="/calculadoras"
                aria-current={
                  activeAction === "calculators" ? "page" : undefined
                }
                className={actionClass(activeAction === "calculators")}
              >
                <Calculator aria-hidden="true" className="size-4" />
                Calculadoras
              </Link>
              <Link
                href="/tabelas"
                aria-current={activeAction === "tables" ? "page" : undefined}
                className={actionClass(activeAction === "tables")}
              >
                <TableProperties aria-hidden="true" className="size-4" />
                Tabelas
              </Link>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
