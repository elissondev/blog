import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Languages } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { getArticleBySlug, getPublishedTranslations } from "@/lib/data";
import { articlePath, LOCALE_CONFIG, type Locale } from "@/lib/locales";
import { formatDate } from "@/lib/utils";

const copy = {
  en: {
    allArticles: "All articles",
    reading: "min read",
    language: "Available languages",
    healthNotice:
      "IMPORTANT: This article is for educational purposes only. It is not intended to diagnose illness or establish treatment. Diagnosis and treatment should always be determined by a qualified health professional.",
  },
  es: {
    allArticles: "Todos los artículos",
    reading: "min de lectura",
    language: "Idiomas disponibles",
    healthNotice:
      "IMPORTANTE: Este artículo tiene fines educativos. No debe utilizarse para diagnosticar enfermedades ni establecer tratamientos. El diagnóstico y el tratamiento deben ser determinados por un profesional de salud cualificado.",
  },
} as const;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function LocalizedArticlePage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const translations = await getPublishedTranslations(
    article.translation_group_id,
  );
  const labels = copy[locale];
  const hasReferences =
    /(^|\n)#{1,3}\s*(references|referencias|referências)\b/im.test(
      article.content_md,
    );
  const healthNotice = article.show_health_disclaimer ? (
    <aside
      role="note"
      className="not-prose my-8 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-100"
    >
      {labels.healthNotice}
    </aside>
  ) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url ?? undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    author: { "@type": "Person", name: article.author_name },
    publisher: { "@type": "Person", name: "Élisson Kario" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${articlePath(locale, article.slug)}`,
    },
    inLanguage: LOCALE_CONFIG[locale].htmlLang,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}`}
          className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground"
        >
          {labels.allArticles}
        </Link>

        {translations.length > 1 && (
          <nav
            aria-label={labels.language}
            className="mb-6 flex flex-wrap items-center gap-2 text-sm"
          >
            <Languages
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            {translations.map((translation) => (
              <Link
                key={translation.language_code}
                href={articlePath(translation.language_code, translation.slug)}
                hrefLang={LOCALE_CONFIG[translation.language_code].htmlLang}
                aria-current={
                  translation.language_code === locale ? "page" : undefined
                }
                className="underline-offset-4 hover:underline aria-[current=page]:font-semibold"
              >
                {LOCALE_CONFIG[translation.language_code].label}
              </Link>
            ))}
          </nav>
        )}

        <header className="mb-8">
          {(article.category_name || article.tags.length > 0) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.category_name && <Badge>{article.category_name}</Badge>}
              {article.tags.map((tag) => (
                <Badge key={tag.slug} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-4 text-sm text-muted-foreground">
            <span>{article.author_name}</span>
            <time dateTime={article.published_at ?? undefined}>
              {formatDate(
                article.published_at,
                locale === "en" ? "en-US" : "es-ES",
              )}
            </time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {article.reading_minutes} {labels.reading}
            </span>
          </div>
        </header>

        {article.cover_image_url && (
          <div className="relative mb-10 aspect-21/9 overflow-hidden rounded-lg bg-muted">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        <Markdown
          content={article.content_md}
          beforeReferences={hasReferences ? healthNotice : undefined}
        />
        {!hasReferences && healthNotice}
      </article>
    </main>
  );
}
