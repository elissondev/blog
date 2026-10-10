import { Suspense } from "react";
import { ArticleListPage } from "@/components/article-list-page";
import { HomeLoading } from "@/components/home-loading";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense fallback={<HomeLoading />}>
      <ArticleListPage searchParams={searchParams} />
    </Suspense>
  );
}
