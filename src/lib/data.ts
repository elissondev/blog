import { isSupabaseConfigured, createClientServer } from "./supabase/server";
import { demoArticles, demoCategories, demoTags, demoArticleMd } from "./demo-data";
import type { ArticleCard, Category, Tag } from "./types";

export const PER_PAGE = 9;

export type ListParams = {
  q?: string | null;
  category?: string | null;
  tag?: string | null;
  author?: string | null;
  sort?: "recent" | "oldest" | "title" | "relevance";
  page?: number;
};

export type ListResult = {
  articles: ArticleCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/* ---------------- Fallbacks demo (sem Supabase configurado) ---------------- */

function demoList(params: ListParams): ListResult {
  let items = [...demoArticles];
  const q = params.q?.trim().toLowerCase();
  if (q)
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q)
    );
  if (params.category) items = items.filter((a) => a.category_slug === params.category);
  if (params.tag) items = items.filter((a) => a.tags.some((t) => t.slug === params.tag));
  if (params.author)
    items = items.filter(
      (a) => a.author_name.toLowerCase().replace(/\s+/g, "-") === params.author
    );

  switch (params.sort) {
    case "oldest":
      items.sort((a, b) => +new Date(a.published_at!) - +new Date(b.published_at!));
      break;
    case "title":
      items.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
      break;
    default:
      items.sort((a, b) => +new Date(b.published_at!) - +new Date(a.published_at!));
  }

  const page = Math.max(1, params.page ?? 1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  return {
    articles: items.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    total,
    page,
    perPage: PER_PAGE,
    totalPages,
  };
}

/* ---------------- API pública usada pelas páginas ---------------- */

export async function listArticles(params: ListParams): Promise<ListResult> {
  if (!isSupabaseConfigured()) return demoList(params);

  const supabase = await createClientServer();
  const page = Math.max(1, params.page ?? 1);
  const { data, error } = await supabase.rpc("search_articles", {
    p_q: params.q?.trim() || null,
    p_category_slug: params.category || null,
    p_tag_slug: params.tag || null,
    p_author_slug: params.author || null,
    p_sort: params.sort || "recent",
    p_page: page,
    p_per_page: PER_PAGE,
  });

  if (error) {
    console.error("search_articles:", error.message);
    return { articles: [], total: 0, page, perPage: PER_PAGE, totalPages: 1 };
  }

  const rows = (data ?? []) as ArticleCard[];
  const total = Number(rows[0]?.total_count ?? 0);
  return {
    articles: rows,
    total,
    page,
    perPage: PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}

export async function getCategories(): Promise<(Category & { count: number })[]> {
  if (!isSupabaseConfigured())
    return demoCategories.map((c) => ({
      ...c,
      count: demoArticles.filter((a) => a.category_slug === c.slug).length,
    }));

  const supabase = await createClientServer();
  const [{ data: cats }, { data: arts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("articles")
      .select("category_id")
      .eq("status", "published"),
  ]);
  const counts = new Map<string, number>();
  for (const a of arts ?? []) {
    if (a.category_id) counts.set(a.category_id, (counts.get(a.category_id) ?? 0) + 1);
  }
  return (cats ?? []).map((c) => ({ ...c, description: c.description ?? "", count: counts.get(c.id) ?? 0 }));
}

export async function getTags(): Promise<(Tag & { count: number })[]> {
  if (!isSupabaseConfigured())
    return demoTags.map((t) => ({
      ...t,
      count: demoArticles.filter((a) => a.tags.some((x) => x.slug === t.slug)).length,
    }));

  const supabase = await createClientServer();
  const [{ data: tags }, { data: links }] = await Promise.all([
    supabase.from("tags").select("*").order("name"),
    supabase.from("article_tags").select("tag_id, article:articles!inner(status)"),
  ]);
  const counts = new Map<string, number>();
  for (const l of links ?? []) {
    const rel = (l as unknown as { article: { status: string } | null }).article;
    if (rel?.status === "published") counts.set(l.tag_id, (counts.get(l.tag_id) ?? 0) + 1);
  }
  return (tags ?? []).map((t) => ({ ...t, count: counts.get(t.id) ?? 0 }));
}

export async function getAuthors(): Promise<{ name: string; slug: string; count: number }[]> {
  if (!isSupabaseConfigured()) {
    const map = new Map<string, number>();
    for (const a of demoArticles) map.set(a.author_name, (map.get(a.author_name) ?? 0) + 1);
    return [...map.entries()].map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      count,
    }));
  }

  const supabase = await createClientServer();
  const { data } = await supabase
    .from("articles")
    .select("author_id, profiles(full_name)")
    .eq("status", "published");
  const map = new Map<string, { name: string; count: number }>();
  for (const row of data ?? []) {
    const p = (row as unknown as { profiles: { full_name: string } | null }).profiles;
    if (!p?.full_name) continue;
    const cur = map.get(row.author_id) ?? { name: p.full_name, count: 0 };
    cur.count += 1;
    map.set(row.author_id, cur);
  }
  return [...map.values()]
    .map((a) => ({ ...a, slug: a.name.toLowerCase().replace(/\s+/g, "-") }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleCard & { content_md: string } | null> {
  if (!isSupabaseConfigured()) {
    const found = demoArticles.find((a) => a.slug === slug) ?? demoArticles[0];
    return { ...found, content_md: demoArticleMd };
  }

  const supabase = await createClientServer();
  const { data } = await supabase
    .from("articles")
    .select(
      "*, categories(name, slug), profiles(full_name, avatar_url), article_tags(tags(name, slug))"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;
  const tagsList = ((data.article_tags ?? []) as unknown as {
    tags: { name: string; slug: string };
  }[])
    .map((x) => x.tags)
    .filter(Boolean);

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    cover_image_url: data.cover_image_url,
    published_at: data.published_at,
    reading_minutes: data.reading_minutes,
    author_name: (data.profiles as { full_name: string } | null)?.full_name ?? "",
    category_name: (data.categories as { name: string } | null)?.name ?? null,
    category_slug: (data.categories as { slug: string } | null)?.slug ?? null,
    tags: tagsList,
    total_count: 1,
    content_md: data.content_md,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return demoArticles.map((a) => a.slug);
  const supabase = await createClientServer();
  const { data } = await supabase.from("articles").select("slug").eq("status", "published");
  return (data ?? []).map((d) => d.slug);
}
