import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/article-list-page";
import { getTags } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return { title: "Tag não encontrada" };
  return {
    title: `#${tag.name}`,
    description: `Artigos com a tag ${tag.name} no site de Élisson Kario.`,
    alternates: { canonical: `/tag/${tag.slug}` },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();

  const sp = await searchParams;
  const merged = Promise.resolve({ ...sp, tag: slug });
  return <ArticleListPage searchParams={merged} title={`Tag: #${tag.name}`} />;
}
