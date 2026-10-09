import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/article-list-page";
import { getCategories } from "@/lib/data";
import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: cat.name,
    description: cat.description || `Artigos da categoria ${cat.name} no NeuroBlog.`,
    alternates: { canonical: `/categoria/${cat.slug}` },
    openGraph: { title: `${cat.name} | NeuroBlog`, description: cat.description ?? undefined, url: `/categoria/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const sp = await searchParams;
  const merged = Promise.resolve({ ...sp, category: slug });
  return <ArticleListPage searchParams={merged} title={`Categoria: ${cat.name}`} />;
}
