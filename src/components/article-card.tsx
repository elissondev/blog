import Image from "next/image";
import Link from "next/link";
import { Clock, Pin, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatDate, authorDisplayName, authorSlug } from "@/lib/utils";
import type { ArticleCard } from "@/lib/types";

export function ArticleCardComponent({ article }: { article: ArticleCard }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/artigo/${article.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-muted"
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
            Sem capa
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
            aria-label="Artigo fixado"
          >
            <Pin className="size-3" /> Fixado
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time
            dateTime={article.published_at ?? undefined}
            className="flex items-center gap-1"
          >
            <Clock className="size-3.5" /> {formatDate(article.published_at)}
          </time>
          <span className="flex items-center gap-1">
            <User className="size-3.5" />
            <Link
              href={`/autor/${authorSlug(article.author_name)}`}
              className="hover:text-foreground"
            >
              {authorDisplayName(article.author_name)}
            </Link>
          </span>
          <span>{article.reading_minutes} min de leitura</span>
        </div>

        <h3 className="font-serif text-lg font-semibold leading-snug">
          <Link href={`/artigo/${article.slug}`} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>

        <p className="flex-1 text-sm text-muted-foreground">
          {article.excerpt}
        </p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <Badge key={t.slug} variant="secondary" asChild>
                <Link href={`/tag/${t.slug}`}>#{t.name}</Link>
              </Badge>
            ))}
          </div>
        )}

        <Button variant="link" size="sm" className="w-fit px-0 mt-1" asChild>
          <Link
            href={`/artigo/${article.slug}`}
            aria-label={`Leia mais sobre ${article.title}`}
          >
            Leia mais →
          </Link>
        </Button>
      </div>
    </article>
  );
}
