import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Clock,
  User,
  Tag as TagIcon,
  ChevronLeft,
  Heart,
  MessageCircle,
  Languages,
} from "lucide-react";
import {
  getArticleBySlug,
  getAuthors,
  getPublishedTranslations,
  listArticles,
} from "@/lib/data";
import { Markdown } from "@/components/markdown";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { ExpandableText } from "@/components/expandable-text";
import { ArticleCardComponent } from "@/components/article-card";
import { ArticleLikeButton } from "@/components/article-like-button";
import {
  ArticleTextSizeControls,
  ArticleTextSizeProvider,
} from "@/components/article-text-size";
import { Badge } from "@/components/ui/badge";
import { authorDisplayName, formatDate, authorSlug } from "@/lib/utils";
import {
  ARTICLE_LANGUAGE_ORDER,
  articlePath,
  LOCALE_CONFIG,
} from "@/lib/locales";

type Props = { params: Promise<{ slug: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artigo não encontrado" };

  const url = articlePath("pt-BR", article.slug);
  const translations = await getPublishedTranslations(
    article.translation_group_id,
  );
  const languages = Object.fromEntries(
    translations.map((translation) => [
      translation.language_code,
      articlePath(translation.language_code, translation.slug),
    ]),
  );
  languages["x-default"] = url;
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags.map((t) => t.name),
    authors: [{ name: authorDisplayName(article.author_name) }],
    alternates: { canonical: url, languages },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? article.published_at ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
      section: article.category_name ?? undefined,
      tags: article.tags.map((t) => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [relatedResult, authors, translations] = await Promise.all([
    listArticles({
      category: article.category_slug,
      perPageHack: undefined,
    } as never),
    getAuthors(),
    getPublishedTranslations(article.translation_group_id),
  ]);
  const related = relatedResult.articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);
  const author = authors.find(
    (item) => item.slug === authorSlug(article.author_name),
  );
  const healthDisclaimer = article.show_health_disclaimer ? (
    <HealthDisclaimer title="Aviso de saúde:">
      Este artigo tem finalidade informativa e educacional. Não substitui
      avaliação, diagnóstico ou orientação individual de um profissional de
      saúde. Para decisões sobre sua saúde, consulte um profissional
      qualificado.
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
    author: {
      "@type": "Person",
      name: authorDisplayName(article.author_name),
    },
    publisher: { "@type": "Person", name: "Élisson Kario" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/artigo/${article.slug}`,
    },
    keywords: article.tags.map((t) => t.name).join(", "),
    articleSection: article.category_name ?? undefined,
    timeRequired: `PT${article.reading_minutes}M`,
    inLanguage: "pt-BR",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleTextSizeProvider>
        <article className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" /> Todos os artigos
          </Link>

          <header className="mb-8">
            {translations.length > 1 && (
              <nav
                aria-label="Idiomas disponíveis"
                className="mb-5 flex flex-wrap items-center gap-2 text-sm"
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
                      hrefLang={
                        LOCALE_CONFIG[translation.language_code].htmlLang
                      }
                      aria-current={
                        translation.language_code === "pt-BR"
                          ? "page"
                          : undefined
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

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {article.category_name && (
                <Badge asChild>
                  <Link href={`/categoria/${article.category_slug}`}>
                    {article.category_name}
                  </Link>
                </Badge>
              )}
              {article.tags.map((t) => (
                <Badge key={t.slug} variant="secondary" asChild>
                  <Link href={`/tag/${t.slug}`}>
                    <TagIcon className="size-3" /> {t.name}
                  </Link>
                </Badge>
              ))}
            </div>

            <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {article.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                <Link
                  href={`/autor/${authorSlug(article.author_name)}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {authorDisplayName(article.author_name)}
                </Link>
              </span>
              <time
                dateTime={article.published_at ?? undefined}
                className="flex items-center gap-1.5"
              >
                <Clock className="size-4" /> {formatDate(article.published_at)}
              </time>
              <span>{article.reading_minutes} min de leitura</span>
              <ArticleTextSizeControls locale="pt-BR" />
            </div>
          </header>

          {article.cover_image_url && (
            <div className="relative mb-10 aspect-21/9 overflow-hidden rounded-xl bg-muted">
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

          <Markdown content={article.content_md} className="article-body" />
          {healthDisclaimer}
          <div className="mt-6 flex justify-end border-b pb-6">
            <ArticleTextSizeControls locale="pt-BR" />
          </div>

          <ArticleLikeButton articleId={article.id} locale="pt-BR" />

          <section className="pt-8" aria-labelledby="sobre-autor">
            <h2 id="sobre-autor" className="mb-4 font-serif text-2xl font-bold">
              Sobre o autor
            </h2>
            <div className="flex items-start gap-4">
              {author?.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={`Foto de ${author.name}`}
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
                <Link
                  href={`/autor/${authorSlug(article.author_name)}`}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {author?.name || authorDisplayName(article.author_name)}
                </Link>
                <ExpandableText
                  text={
                    author?.article_description ||
                    `Acompanhe outros artigos publicados por ${authorDisplayName(article.author_name)}.`
                  }
                  className="mt-1 text-sm leading-relaxed text-muted-foreground"
                  buttonClassName="text-primary hover:underline focus-visible:outline-primary"
                />
                <Link
                  href={`/autor/${authorSlug(article.author_name)}`}
                  className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Ver artigos do autor
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
                Apoie este trabalho
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Este blog é mantido de forma 100% independente, livre de
                patrocínios da indústria ou narrativas da mídia. Se este
                conteúdo foi útil e você quer ajudar a financiar a busca por
                informação objetiva, considere fazer uma doação. Produzir
                artigos aprofundados e testados na prática exige dezenas de
                horas de pesquisa e investigação. Sua contribuição ajuda a
                manter este site no ar e me permite dedicar mais tempo a trazer
                a verdade à tona.
              </p>
              <Link
                href={`https://wa.me/5542999355018?text=${encodeURIComponent("Olá Élisson, gostaria de contribuir com seu site doando uma quantia para você.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Falar sobre doação
              </Link>
            </div>
          </section>
        </article>
      </ArticleTextSizeProvider>

      {related.length > 0 && (
        <section
          className="mx-auto mt-16 max-w-5xl"
          aria-labelledby="relacionados"
        >
          <h2 id="relacionados" className="mb-6 font-serif text-2xl font-bold">
            Artigos relacionados
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCardComponent key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
