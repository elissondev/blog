import type { MetadataRoute } from "next";
import {
  getAuthors,
  getCategories,
  getTags,
  getSitemapArticles,
} from "@/lib/data";
import { articlePath } from "@/lib/locales";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, cats, tags, authors] = await Promise.all([
    getSitemapArticles(),
    getCategories(),
    getTags(),
    getAuthors(),
  ]);

  const translationsByGroup = new Map<string, typeof articles>();
  for (const article of articles) {
    const group = translationsByGroup.get(article.translation_group_id) ?? [];
    group.push(article);
    translationsByGroup.set(article.translation_group_id, group);
  }

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
    ...articles.map((article) => {
      const related =
        translationsByGroup.get(article.translation_group_id) ?? [];
      const languages = Object.fromEntries(
        related.map((translation) => [
          translation.language_code,
          `${siteUrl}${articlePath(translation.language_code, translation.slug)}`,
        ]),
      );
      const portuguese = related.find(
        (translation) => translation.language_code === "pt-BR",
      );
      if (portuguese)
        languages["x-default"] =
          `${siteUrl}${articlePath("pt-BR", portuguese.slug)}`;

      return {
        url: `${siteUrl}${articlePath(article.language_code, article.slug)}`,
        alternates: { languages },
        ...(article.lastModified
          ? { lastModified: new Date(article.lastModified) }
          : {}),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    }),
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
