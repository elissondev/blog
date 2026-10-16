import type { MetadataRoute } from "next";
import {
  getAuthors,
  getCategories,
  getTags,
  getSitemapArticles,
} from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, cats, tags, authors] = await Promise.all([
    getSitemapArticles(),
    getCategories(),
    getTags(),
    getAuthors(),
  ]);

  return [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/calculadoras`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    { url: `${siteUrl}/tabelas`, changeFrequency: "yearly", priority: 0.5 },
    ...authors.map((author) => ({
      url: `${siteUrl}/autor/${author.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/artigo/${article.slug}`,
      ...(article.lastModified
        ? { lastModified: new Date(article.lastModified) }
        : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...cats
      .filter((category) => category.count > 0)
      .map((category) => ({
        url: `${siteUrl}/categoria/${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...tags
      .filter((tag) => tag.count > 0)
      .map((tag) => ({
        url: `${siteUrl}/tag/${tag.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      })),
  ];
}
