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
  TriangleAlert,
} from "lucide-react";
import { getArticleBySlug, getAuthors, listArticles } from "@/lib/data";
import { hasReferencesSection, Markdown } from "@/components/markdown";
import { ExpandableText } from "@/components/expandable-text";
import { ArticleCardComponent } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { authorDisplayName, formatDate, authorSlug } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artigo não encontrado" };

  const url = `/artigo/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags.map((t) => t.name),
    authors: [{ name: authorDisplayName(article.author_name) }],
    alternates: { canonical: url },
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

  const [relatedResult, authors] = await Promise.all([
    listArticles({
      category: article.category_slug,
      perPageHack: undefined,
    } as never),
    getAuthors(),
  ]);
  const related = relatedResult.articles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);
  const author = authors.find(
    (item) => item.slug === authorSlug(article.author_name),
  );
  const healthDisclaimer = article.show_health_disclaimer ? (
    <aside
      role="note"
      className="not-prose my-8 flex flex-col items-start gap-2 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 sm:flex-row sm:gap-3 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <TriangleAlert
        className="size-5 shrink-0 text-amber-700 sm:mt-0.5 dark:text-amber-300"
        aria-hidden="true"
      />
      <div>
        <strong>IMPORTANTE:</strong> As informações contidas neste artigo são
        apenas para divulgação do conhecimento, não devendo ser usadas com o
        objetivo de diagnosticar doenças ou estabelecer qualquer tipo de
        tratamento. Lembramos que diagnósticos e tratamentos precisam sempre ser
        estabelecidos por um profissional de saúde de sua confiança.
      </div>
    </aside>
  ) : null;
  const hasReferences = hasReferencesSection(article.content_md);

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

      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Todos os artigos
        </Link>

        <header className="mb-8">
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
          </div>
        </header>

        {article.cover_image_url && (
          <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
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
          beforeReferences={hasReferences ? healthDisclaimer : undefined}
        />
        {!hasReferences && healthDisclaimer}

        <section className="mt-12 border-t pt-8" aria-labelledby="sobre-autor">
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

        <section
          className="mt-8 rounded-lg border bg-card p-5"
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
            Este blog é mantido de forma 100% independente, livre de patrocínios
            da indústria ou narrativas da mídia. Se este conteúdo foi útil e
            você quer ajudar a financiar a busca por informação objetiva,
            considere fazer uma doação. Produzir artigos aprofundados e testados
            na prática exige dezenas de horas de pesquisa e investigação. Sua
            contribuição ajuda a manter este site no ar e me permite dedicar
            mais tempo a trazer a verdade à tona.
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
        </section>
      </article>

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
