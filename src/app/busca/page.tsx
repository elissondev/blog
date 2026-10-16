import { ArticleListPage } from "@/components/article-list-page";
import { Hero } from "@/components/hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Busca",
  description:
    "Pesquise estudos, pesquisas e artigos sobre nutrição e alimentação.",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = params.q?.trim();
  const description = query
    ? `Resultados para “${query}”${
        params.category ? " na categoria selecionada" : ""
      }.`
    : params.category
      ? "Artigos da categoria selecionada."
      : "Pesquise artigos, estudos e pesquisas na base.";
  const listTitle = query
    ? "Artigos encontrados"
    : params.category
      ? "Artigos da categoria"
      : "Todos os artigos";

  return (
    <>
      <Hero title="Busca" description={description} compact />
      <ArticleListPage
        searchParams={Promise.resolve(params)}
        title={listTitle}
        headingLevel="h2"
      />
    </>
  );
}
