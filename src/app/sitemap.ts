import type { MetadataRoute } from "next";
import { getCategories, getTags, getAllSlugs } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, cats, tags] = await Promise.all([getAllSlugs(), getCategories(), getTags()]);
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...slugs.map((s) => ({ url: `${siteUrl}/artigo/${s}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...cats.map((c) => ({ url: `${siteUrl}/categoria/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...tags.map((t) => ({ url: `${siteUrl}/tag/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
