import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/article-list-page";
import { getAuthors } from "@/lib/data";
import { canonicalPageUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const authors = await getAuthors();
  const author = authors.find((item) => item.slug === slug);
  if (!author)
    return { title: "Autor não encontrado", robots: { index: false } };
  const canonical = canonicalPageUrl(`/autor/${slug}`, query);
  return {
    title: `Artigos de ${author.name}`,
    description: `Artigos publicados por ${author.name} no site de Élisson Kario.`,
    alternates: { canonical },
    openGraph: {
      title: `Artigos de ${author.name} | Élisson Kario`,
      description: `Artigos publicados por ${author.name} no site de Élisson Kario.`,
      url: canonical,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const authors = await getAuthors();
  const author = authors.find((item) => item.slug === slug);
  if (!author) notFound();
  const sp = await searchParams;
  const merged = Promise.resolve({ ...sp, author: slug });
  return (
    <ArticleListPage
      searchParams={merged}
      title={`Artigos de ${author.name}`}
    />
  );
}
