import { listArticles, getArticleBySlug } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const { articles } = await listArticles({ sort: "recent", page: 1 });

  // pega o conteúdo completo dos 3 primeiros para enriquecer o feed
  const full = await Promise.all(
    articles.slice(0, 3).map((a) => getArticleBySlug(a.slug)),
  );

  const items = articles
    .map((a, i) => {
      const body = full[i]?.content_md ?? a.excerpt;
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${siteUrl}/artigo/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/artigo/${a.slug}</guid>
      <pubDate>${new Date(a.published_at ?? Date.now()).toUTCString()}</pubDate>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${esc(a.author_name)}</dc:creator>
      <category>${esc(a.category_name ?? "")}</category>
      ${a.tags.map((t) => `<category>${esc(t.name)}</category>`).join("")}
      <description><![CDATA[${esc(a.excerpt)}]]></description>
      <content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/"><![CDATA[${body}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Élisson Kario — Nutrição e Ciência</title>
    <link>${siteUrl}</link>
    <description>Estudos, pesquisas e artigos sobre nutrição e alimentação, compartilhados por Élisson Kario, estudante de Nutrição.</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
