import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/article-list-page";
import { Hero } from "@/components/hero";
import { getCategories } from "@/lib/data";
import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: cat.name,
    description:
      cat.description ||
      `Artigos da categoria ${cat.name} no site de Élisson Kario.`,
    alternates: { canonical: `/categoria/${cat.slug}` },
    openGraph: {
      title: `${cat.name} | Élisson Kario`,
      description: cat.description ?? undefined,
      url: `/categoria/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const sp = await searchParams;
  const merged = Promise.resolve({ ...sp, category: slug });
  return (
    <>
      <Hero
        title={cat.name}
        description={
          cat.description || `Artigos e conteúdos sobre ${cat.name}.`
        }
        compact
      />
      <ArticleListPage
        searchParams={merged}
        title="Artigos"
        headingLevel="h2"
      />
    </>
  );
}
