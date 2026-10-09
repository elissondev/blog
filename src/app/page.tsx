import { ArticleListPage } from "@/components/article-list-page";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <ArticleListPage searchParams={searchParams} />;
}
