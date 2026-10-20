import Image from "next/image";
import Link from "next/link";
import { Clock, Pin, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatDate, authorDisplayName, authorSlug } from "@/lib/utils";
import type { ArticleCard } from "@/lib/types";
import {
  articlePath,
  authorPath,
  localizedTaxonomyName,
  type ArticleLanguage,
} from "@/lib/locales";

export function ArticleCardComponent({
  article,
  showTags = true,
  language = "pt-BR",
}: {
  article: ArticleCard;
  showTags?: boolean;
  language?: ArticleLanguage;
}) {
  const href = articlePath(language, article.slug);
  const copy =
    language === "en"
      ? {
          noCover: "No cover",
          pinned: "Pinned",
          reading: "min read",
          read: "Read more",
        }
      : language === "es"
        ? {
            noCover: "Sin portada",
            pinned: "Fijado",
            reading: "min de lectura",
            read: "Leer más",
          }
        : {
            noCover: "Sem capa",
            pinned: "Fixado",
            reading: "min de leitura",
            read: "Leia mais",
          };
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={href}
        className="relative block aspect-video overflow-hidden bg-muted"
        aria-label={article.title}
      >
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {copy.noCover}
          </div>
        )}
        {article.category_name && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow">
            {article.category_name}
          </Badge>
        )}
        {article.is_pinned && (
          <Badge
            className="absolute right-3 top-3 gap-1 shadow"
            aria-label={copy.pinned}
          >
            <Pin className="size-3" /> {copy.pinned}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time
            dateTime={article.published_at ?? undefined}
            className="flex items-center gap-1"
          >
            <Clock className="size-3.5" />
            {formatDate(
              article.published_at,
              language === "en"
                ? "en-US"
                : language === "es"
                  ? "es-ES"
                  : "pt-BR",
            )}
          </time>
          <span className="flex items-center gap-1">
            <User className="size-3.5" />
            <Link
              href={authorPath(language, authorSlug(article.author_name))}
              className="hover:text-foreground"
            >
              {authorDisplayName(article.author_name)}
            </Link>
          </span>
          <span>
            {article.reading_minutes} {copy.reading}
          </span>
        </div>

        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link href={href} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>

        <p className="flex-1 text-sm text-muted-foreground">
          {article.excerpt}
        </p>

        {showTags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Badge key={t.slug} variant="secondary">
                #{localizedTaxonomyName(t, language)}
              </Badge>
            ))}
          </div>
        )}

        <Button variant="link" size="sm" className="w-fit px-0 mt-1" asChild>
          <Link href={href} aria-label={`${copy.read} ${article.title}`}>
            {copy.read} →
          </Link>
        </Button>
      </div>
    </article>
  );
}
