import { listArticles } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET() {
  const { articles } = await listArticles({ sort: "recent", page: 1 });
  const body = `# Élisson Kario

> Estudos, pesquisas e artigos sobre nutrição e alimentação, compartilhados por Élisson Kario, estudante de Nutrição.

## Artigos publicados
${articles.map((a) => `- [${a.title}](${siteUrl}/artigo/${a.slug}): ${a.excerpt} (autor: ${a.author_name}; categoria: ${a.category_name ?? "—"}; tags: ${a.tags.map((t) => t.name).join(", ") || "—"})`).join("\n")}

## Feeds
- RSS: ${siteUrl}/feed.xml
- Sitemap: ${siteUrl}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
