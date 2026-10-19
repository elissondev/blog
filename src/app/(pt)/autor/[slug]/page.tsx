import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListPage } from "@/components/article-list-page";
import { Hero } from "@/components/hero";
import { getAuthors } from "@/lib/data";
import { authorSlug, canonicalPageUrl } from "@/lib/utils";

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
  const author = authors.find((item) => item.slug === authorSlug(slug));
  if (!author)
    return { title: "Autor não encontrado", robots: { index: false } };
  const canonical = canonicalPageUrl(`/autor/${author.slug}`, query);
  const description =
    author.description ||
    `Artigos publicados por ${author.name} no site de Élisson Kario.`;
  return {
    title: `Artigos de ${author.name}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `Artigos de ${author.name} | Élisson Kario`,
      description,
      url: canonical,
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const authors = await getAuthors();
  const author = authors.find((item) => item.slug === authorSlug(slug));
  if (!author) notFound();
  const sp = await searchParams;
  const merged = Promise.resolve({ ...sp, author: author.filterSlug });
  return (
    <>
      <Hero
        title={author.name}
        description={
          author.description ||
          `Artigos publicados por ${author.name} no site de Élisson Kario.`
        }
        avatarUrl={author.avatar_url}
        badgeText="Autor"
        expandableDescription
      />
      <ArticleListPage
        searchParams={merged}
        title="Artigos"
        headingLevel="h2"
      />
    </>
  );
}
