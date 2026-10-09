import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, User, Tag as TagIcon, ChevronLeft } from "lucide-react";
import { getArticleBySlug, getAllSlugs, listArticles } from "@/lib/data";
import { Markdown } from "@/components/markdown";
import { ArticleCardComponent } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { formatDate, authorSlug } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artigo não encontrado" };

  const url = `/artigo/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags.map((t) => t.name),
    authors: [{ name: article.author_name }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.published_at ?? undefined,
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

  const related = (await listArticles({ category: article.category_slug, perPageHack: undefined } as never))
    .articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url ?? undefined,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: { "@type": "Person", name: article.author_name },
    publisher: { "@type": "Organization", name: "NeuroBlog" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `/artigo/${article.slug}` },
    keywords: article.tags.map((t) => t.name).join(", "),
    articleSection: article.category_name ?? undefined,
    timeRequired: `PT${article.reading_minutes}M`,
    inLanguage: "pt-BR",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Todos os artigos
        </Link>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {article.category_name && (
              <Badge asChild><Link href={`/categoria/${article.category_slug}`}>{article.category_name}</Link></Badge>
            )}
            {article.tags.map((t) => (
              <Badge key={t.slug} variant="secondary" asChild>
                <Link href={`/tag/${t.slug}`}><TagIcon className="size-3" /> {t.name}</Link>
              </Badge>
            ))}
          </div>

          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              <Link href={`/autor/${authorSlug(article.author_name)}`} className="font-medium text-foreground hover:text-primary">
                {article.author_name}
              </Link>
            </span>
            <time dateTime={article.published_at ?? undefined} className="flex items-center gap-1.5">
              <Clock className="size-4" /> {formatDate(article.published_at)}
            </time>
            <span>{article.reading_minutes} min de leitura</span>
          </div>
        </header>

        {article.cover_image_url && (
          <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-xl bg-muted">
            <Image src={article.cover_image_url} alt={article.title} fill priority sizes="(max-width: 768px) 100vw, 896px" className="object-cover" />
          </div>
        )}

        <Markdown content={article.content_md} />
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl" aria-labelledby="relacionados">
          <h2 id="relacionados" className="mb-6 font-serif text-2xl font-bold">Artigos relacionados</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((a) => <ArticleCardComponent key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}
