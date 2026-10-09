import { listArticles } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET() {
  const { articles } = await listArticles({ sort: "recent", page: 1 });
  const body = `# NeuroBlog

> Blog de neurociência aplicada ao dia a dia: artigos baseados em evidências sobre sono, foco, emoções, hábitos e saúde mental, escritos por especialistas.

## Artigos publicados
${articles.map((a) => `- [${a.title}](${siteUrl}/artigo/${a.slug}): ${a.excerpt} (autor: ${a.author_name}; categoria: ${a.category_name ?? "—"}; tags: ${a.tags.map((t) => t.name).join(", ") || "—"})`).join("\n")}

## Categorias
- [Neurociência](${siteUrl}/categoria/neurociencia)
- [Saúde Mental](${siteUrl}/categoria/saude-mental)
- [Produtividade](${siteUrl}/categoria/produtividade)
- [Sono](${siteUrl}/categoria/sono)

## Feeds
- RSS: ${siteUrl}/feed.xml
- Sitemap: ${siteUrl}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
