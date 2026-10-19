import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCardComponent } from "@/components/article-card";
import { listArticles } from "@/lib/data";
import { isLocale } from "@/lib/locales";

export const instant = false;

const pageCopy = {
  en: {
    title: "Articles",
    description: "Nutrition and science, grounded in research and evidence.",
    empty: "No articles have been published in English yet.",
  },
  es: {
    title: "Artículos",
    description: "Nutrición y ciencia basadas en investigación y evidencia.",
    empty: "Todavía no hay artículos publicados en español.",
  },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: pageCopy[locale].title,
    description: pageCopy[locale].description,
    alternates: { canonical: `/${locale}` },
  };
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { articles } = await listArticles({ language: locale, sort: "recent" });
  const copy = pageCopy[locale];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b pb-6">
        <h1 className="font-serif text-3xl font-bold">{copy.title}</h1>
        <p className="mt-2 text-muted-foreground">{copy.description}</p>
      </header>
      {articles.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCardComponent
              key={article.id}
              article={article}
              language={locale}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-muted-foreground">{copy.empty}</p>
      )}
    </main>
  );
}
