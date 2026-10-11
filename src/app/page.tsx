import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleListPage } from "@/components/article-list-page";
import { HomeLoading } from "@/components/home-loading";
import { canonicalPageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  return {
    alternates: {
      canonical: canonicalPageUrl("/", await searchParams),
    },
  };
}

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
