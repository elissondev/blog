import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Heart,
  Languages,
  MessageCircle,
  User,
} from "lucide-react";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { Markdown } from "@/components/markdown";
import { ArticleLikeButton } from "@/components/article-like-button";
import { Badge } from "@/components/ui/badge";
import {
  getArticleBySlug,
  getAuthors,
  hasPublishedHealthDisclaimer,
  getPublishedTranslations,
} from "@/lib/data";
import { getArticleCopy } from "@/lib/article-copy";
import {
  ARTICLE_LANGUAGE_ORDER,
  articlePath,
  authorPath,
  LOCALE_CONFIG,
  type Locale,
} from "@/lib/locales";
import { authorDisplayName, authorSlug, formatDate } from "@/lib/utils";

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

  const [translations, authors, healthNoticeEnabled] = await Promise.all([
    getPublishedTranslations(article.translation_group_id),
    getAuthors(),
    hasPublishedHealthDisclaimer(article.translation_group_id),
  ]);
  const labels = getArticleCopy(locale);
  const author = authors.find(
    (item) => item.slug === authorSlug(article.author_name),
  );
  const healthNotice = healthNoticeEnabled ? (
    <HealthDisclaimer title={labels.healthNoticeTitle}>
      {labels.healthNotice}
    </HealthDisclaimer>
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
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
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
            {[...translations]
              .sort(
                (a, b) =>
                  ARTICLE_LANGUAGE_ORDER.indexOf(a.language_code) -
                  ARTICLE_LANGUAGE_ORDER.indexOf(b.language_code),
              )
              .map((translation) => (
                <Link
                  key={translation.language_code}
                  href={articlePath(
                    translation.language_code,
                    translation.slug,
                  )}
                  hrefLang={LOCALE_CONFIG[translation.language_code].htmlLang}
                  aria-current={
                    translation.language_code === locale ? "page" : undefined
                  }
                  className="inline-flex items-center gap-1 underline-offset-4 hover:underline aria-[current=page]:font-semibold"
                >
                  <span aria-hidden="true">
                    {LOCALE_CONFIG[translation.language_code].flag}
                  </span>
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
            <span>
              {labels.by} {authorDisplayName(article.author_name)}
            </span>
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

        <Markdown content={article.content_md} />
        {healthNotice}
        <ArticleLikeButton articleId={article.id} locale={locale} />
        <section className="pt-8" aria-labelledby="about-author">
          <h2 id="about-author" className="mb-4 font-serif text-2xl font-bold">
            {labels.aboutAuthor}
          </h2>
          <div className="flex items-start gap-4">
            {author?.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt={authorDisplayName(article.author_name)}
                width={72}
                height={72}
                className="size-18 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-18 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="size-8" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {author?.name || authorDisplayName(article.author_name)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {(locale === "en"
                  ? author?.article_description_en
                  : author?.article_description_es) ||
                  labels.authorDescription.replace(
                    "{name}",
                    authorDisplayName(article.author_name),
                  )}
              </p>
              <Link
                href={authorPath(locale, authorSlug(article.author_name))}
                className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
              >
                {labels.authorArticles}
              </Link>
            </div>
          </div>
        </section>
        <section className="mt-8 border-t pt-8">
          <div
            className="rounded-lg border bg-card p-5"
            aria-labelledby="article-donation-heading"
          >
            <h2
              id="article-donation-heading"
              className="flex items-center gap-2 font-serif text-xl font-bold"
            >
              <Heart className="size-5 text-primary" aria-hidden="true" />
              {labels.donationTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {labels.donationDescription}
            </p>
            <Link
              href={`https://wa.me/5542999355018?text=${encodeURIComponent(labels.donationMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {labels.donationAction}
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
