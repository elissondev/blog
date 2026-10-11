import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/article-list-page";
import { getTags } from "@/lib/data";
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
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return { title: "Tag não encontrada" };
  const canonical = canonicalPageUrl(`/tag/${tag.slug}`, query);
  return {
    title: `#${tag.name}`,
    description: `Artigos com a tag ${tag.name} no site de Élisson Kario.`,
    alternates: { canonical },
    openGraph: {
      title: `#${tag.name} | Élisson Kario`,
      description: `Artigos com a tag ${tag.name} no site de Élisson Kario.`,
      url: canonical,
    },
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
