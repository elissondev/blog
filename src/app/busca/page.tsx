import { ArticleListPage } from "@/components/article-list-page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque artigos por palavra-chave no NeuroBlog.",
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <ArticleListPage searchParams={searchParams} />;
}
