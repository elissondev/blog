import type { Metadata } from "next";
import { ArticleListPage } from "@/components/article-list-page";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  return {
    title: `Artigos de ${name}`,
    description: `Artigos publicados por ${name} no site de Élisson Kario.`,
    alternates: { canonical: `/autor/${slug}` },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const merged = Promise.resolve({ ...sp, author: slug });
  return <ArticleListPage searchParams={merged} title="Por autor" />;
}
