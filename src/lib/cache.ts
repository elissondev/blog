import { revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  articles: "articles",
  authors: "authors",
  categories: "categories",
  quotes: "quotes",
  sitemap: "sitemap",
  tags: "tags",
} as const;

export function invalidatePublicCache(...tags: string[]) {
  for (const tag of new Set(tags)) {
    revalidateTag(tag, { expire: 0 });
  }
}