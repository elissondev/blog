import { notFound } from "next/navigation";
import { ArticleCardComponent } from "@/components/article-card";
import { Hero } from "@/components/hero";
import { Pagination } from "@/components/pagination";
import { getAuthors, listArticles } from "@/lib/data";
import { authorSlug } from "@/lib/utils";
import type { Locale } from "@/lib/locales";

const copy = {
  en: {
    badge: "Author",
    articles: "Articles",
    empty:
      "No articles by this author have been published in this language yet.",
    fallback: "Articles published by {name} on Élisson Kario's website.",
    count: "articles",
    article: "article",
  },
  es: {
    badge: "Autor",
    articles: "Artículos",
    empty: "Todavía no hay artículos de este autor publicados en este idioma.",
    fallback: "Artículos publicados por {name} en el sitio de Élisson Kario.",
    count: "artículos",
    article: "artículo",
  },
} satisfies Record<Locale, Record<string, string>>;

export async function LocalizedAuthorPage({
  locale,
  slug,
  searchParams,
}: {
  locale: Locale;
  slug: string;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const authors = await getAuthors();
  const author = authors.find((item) => item.slug === authorSlug(slug));
  if (!author) notFound();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const result = await listArticles({
    author: author.filterSlug,
    language: locale,
    page,
  });
  const labels = copy[locale];
  const description =
    (locale === "en" ? author.description_en : author.description_es) ||
    labels.fallback.replace("{name}", author.name);

  return (
    <>
      <Hero
        title={author.name}
        description={description}
        avatarUrl={author.avatar_url}
        badgeText={labels.badge}
        expandableDescription
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold">{labels.articles}</h2>
          <p className="text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? labels.article : labels.count}
          </p>
        </div>
        {result.articles.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {result.articles.map((article) => (
              <ArticleCardComponent
                key={article.id}
                article={article}
                showTags={false}
                language={locale}
              />
            ))}
          </div>
        )}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          searchParams={{ ...params, author: author.filterSlug }}
          language={locale}
        />
      </section>
    </>
  );
}
