import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured, createClientPublic } from "./supabase/server";
import { CACHE_TAGS } from "./cache";
import {
  demoArticles,
  demoCategories,
  demoTags,
  demoArticleMd,
} from "./demo-data";
import type { ArticleCard, Category, InspirationalQuote, Tag } from "./types";
import {
  localizedTaxonomyName,
  localizedTaxonomySlug,
  type ArticleLanguage,
} from "./locales";
import { authorDisplayName, authorFilterSlug, authorSlug } from "./utils";

export const PER_PAGE = 9;

export type ListParams = {
  q?: string | null;
  category?: string | null;
  tag?: string | null;
  author?: string | null;
  sort?: "recent" | "oldest" | "title" | "relevance";
  page?: number;
  language?: ArticleLanguage;
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
  let items =
    params.language && params.language !== "pt-BR" ? [] : [...demoArticles];
  const q = params.q?.trim().toLowerCase();
  if (q)
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q),
    );
  if (params.category)
    items = items.filter((a) => a.category_slug === params.category);
  if (params.tag)
    items = items.filter((a) => a.tags.some((t) => t.slug === params.tag));
  if (params.author)
    items = items.filter(
      (a) => a.author_name.toLowerCase().replace(/\s+/g, "-") === params.author,
    );

  const pinnedFirst = !params.category && !params.tag;
  switch (params.sort) {
    case "oldest":
      items.sort(
        (a, b) =>
          (pinnedFirst
            ? Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned))
            : 0) || +new Date(a.published_at!) - +new Date(b.published_at!),
      );
      break;
    case "title":
      items.sort(
        (a, b) =>
          (pinnedFirst
            ? Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned))
            : 0) || a.title.localeCompare(b.title, "pt-BR"),
      );
      break;
    default:
      items.sort(
        (a, b) =>
          (pinnedFirst
            ? Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned))
            : 0) || +new Date(b.published_at!) - +new Date(a.published_at!),
      );
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

  const normalizedParams: Required<ListParams> = {
    q: params.q?.trim() || null,
    category: params.category || null,
    tag: params.tag || null,
    author: params.author || null,
    sort: params.sort || "recent",
    page: Math.max(1, params.page ?? 1),
    language: params.language ?? "pt-BR",
  };
  return getCachedArticleList(normalizedParams);
}

async function getCachedArticleList(
  params: Required<ListParams>,
): Promise<ListResult> {
  "use cache";
  cacheLife(
    params.q
      ? { stale: 300, revalidate: 60, expire: 3600 }
      : { stale: 300, revalidate: 3600, expire: 86400 },
  );
  cacheTag(
    CACHE_TAGS.articles,
    CACHE_TAGS.authors,
    CACHE_TAGS.categories,
    CACHE_TAGS.tags,
  );

  const supabase = createClientPublic();
  const page = params.page;
  const { data, error } = await supabase.rpc("search_articles", {
    p_q: params.q?.trim() || null,
    p_category_slug: params.category || null,
    p_tag_slug: params.tag || null,
    p_author_slug: params.author || null,
    p_sort: params.sort || "recent",
    p_page: page,
    p_per_page: PER_PAGE,
    p_language_code: params.language,
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

export async function getRandomQuote(): Promise<InspirationalQuote | null> {
  if (!isSupabaseConfigured()) return null;

  const quotes = await getCachedQuotes();
  if (quotes.length === 0) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

async function getCachedQuotes(): Promise<InspirationalQuote[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.quotes);

  const supabase = createClientPublic();
  const { data, error } = await supabase
    .from("quotes")
    .select("id, text, author")
    .limit(1000);

  if (error) {
    console.error("quotes:", error.message);
    return [];
  }

  return (data ?? []) as InspirationalQuote[];
}

export async function getCategories(): Promise<
  (Category & { count: number })[]
> {
  if (!isSupabaseConfigured())
    return demoCategories.map((c) => ({
      ...c,
      count: demoArticles.filter((a) => a.category_slug === c.slug).length,
    }));

  return getCachedCategories();
}

async function getCachedCategories(): Promise<
  (Category & { count: number })[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.articles);

  const supabase = createClientPublic();
  const [{ data: cats }, { data: arts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("articles")
      .select("category_id")
      .eq("status", "published")
      .eq("language_code", "pt-BR"),
  ]);
  const counts = new Map<string, number>();
  for (const a of arts ?? []) {
    if (a.category_id)
      counts.set(a.category_id, (counts.get(a.category_id) ?? 0) + 1);
  }
  return (cats ?? []).map((c) => ({
    ...c,
    description: c.description ?? "",
    count: counts.get(c.id) ?? 0,
  }));
}

export async function getTags(): Promise<(Tag & { count: number })[]> {
  if (!isSupabaseConfigured())
    return demoTags.map((t) => ({
      ...t,
      count: demoArticles.filter((a) => a.tags.some((x) => x.slug === t.slug))
        .length,
    }));

  return getCachedTags();
}

async function getCachedTags(): Promise<(Tag & { count: number })[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.tags, CACHE_TAGS.articles);

  const supabase = createClientPublic();
  const [{ data: tags }, { data: links }] = await Promise.all([
    supabase.from("tags").select("*").order("name"),
    supabase
      .from("article_tags")
      .select("tag_id, article:articles!inner(status,language_code)"),
  ]);
  const counts = new Map<string, number>();
  for (const l of links ?? []) {
    const rel = (
      l as unknown as {
        article: { status: string; language_code: string } | null;
      }
    ).article;
    if (rel?.status === "published" && rel.language_code === "pt-BR")
      counts.set(l.tag_id, (counts.get(l.tag_id) ?? 0) + 1);
  }
  return (tags ?? []).map((t) => ({ ...t, count: counts.get(t.id) ?? 0 }));
}

export async function getAuthors(): Promise<
  {
    name: string;
    slug: string;
    filterSlug: string;
    count: number;
    description: string | null;
    description_en: string | null;
    description_es: string | null;
    article_description: string | null;
    article_description_en: string | null;
    article_description_es: string | null;
    avatar_url: string | null;
  }[]
> {
  if (!isSupabaseConfigured()) {
    const map = new Map<string, number>();
    for (const a of demoArticles)
      map.set(a.author_name, (map.get(a.author_name) ?? 0) + 1);
    return [...map.entries()].map(([name, count]) => ({
      name: authorDisplayName(name),
      slug: authorSlug(name),
      filterSlug: authorFilterSlug(name),
      count,
      description: null,
      description_en: null,
      description_es: null,
      article_description: null,
      article_description_en: null,
      article_description_es: null,
      avatar_url: null,
    }));
  }

  return getCachedAuthors();
}

async function getCachedAuthors(): Promise<
  Awaited<ReturnType<typeof getAuthors>>
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.authors, CACHE_TAGS.articles);

  const supabase = createClientPublic();
  const { data } = await supabase
    .from("articles")
    .select(
      "author_id, profiles(full_name, description, description_en, description_es, article_description, article_description_en, article_description_es, avatar_url)",
    )
    .eq("status", "published")
    .eq("language_code", "pt-BR");
  const map = new Map<
    string,
    {
      name: string;
      count: number;
      description: string | null;
      description_en: string | null;
      description_es: string | null;
      article_description: string | null;
      article_description_en: string | null;
      article_description_es: string | null;
      avatar_url: string | null;
    }
  >();
  for (const row of data ?? []) {
    const p = (
      row as unknown as {
        profiles: {
          full_name: string;
          description: string | null;
          description_en: string | null;
          description_es: string | null;
          article_description: string | null;
          article_description_en: string | null;
          article_description_es: string | null;
          avatar_url: string | null;
        } | null;
      }
    ).profiles;
    if (!p?.full_name) continue;
    const cur = map.get(row.author_id) ?? {
      name: p.full_name,
      count: 0,
      description: p.description,
      description_en: p.description_en,
      description_es: p.description_es,
      article_description: p.article_description,
      article_description_en: p.article_description_en,
      article_description_es: p.article_description_es,
      avatar_url: p.avatar_url,
    };
    cur.count += 1;
    map.set(row.author_id, cur);
  }
  return [...map.values()]
    .map((a) => ({
      ...a,
      name: authorDisplayName(a.name),
      slug: authorSlug(a.name),
      filterSlug: authorFilterSlug(a.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function getArticleBySlug(
  slug: string,
  language: ArticleLanguage = "pt-BR",
): Promise<
  | (ArticleCard & {
      content_md: string;
      language_code: ArticleLanguage;
      translation_group_id: string;
    })
  | null
> {
  if (!isSupabaseConfigured()) {
    if (language !== "pt-BR") return null;
    const found = demoArticles.find((a) => a.slug === slug);
    return found
      ? {
          ...found,
          content_md: demoArticleMd,
          language_code: "pt-BR",
          translation_group_id: found.id,
        }
      : null;
  }

  return getCachedArticle(slug, language);
}

async function getCachedArticle(
  slug: string,
  language: ArticleLanguage,
): Promise<Awaited<ReturnType<typeof getArticleBySlug>>> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60 * 60 * 24 * 365 });

  const supabase = createClientPublic();
  const { data } = await supabase
    .from("articles")
    .select(
      "*, categories(id, name, slug, name_en, slug_en, name_es, slug_es), profiles(id, full_name, avatar_url), article_tags(tags(id, name, slug, name_en, slug_en, name_es, slug_es))",
    )
    .eq("slug", slug)
    .eq("language_code", language)
    .eq("status", "published")
    .maybeSingle();

  const cacheTags = [`article:${slug}`, `article:${language}:${slug}`];
  if (!data) {
    cacheTag(...cacheTags);
    return null;
  }

  const profile = data.profiles as {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  const category = data.categories as {
    id: string;
    name: string;
    slug: string;
    name_en?: string | null;
    slug_en?: string | null;
    name_es?: string | null;
    slug_es?: string | null;
  } | null;
  type LocalizedTag = {
    id: string;
    name: string;
    slug: string;
    name_en?: string | null;
    slug_en?: string | null;
    name_es?: string | null;
    slug_es?: string | null;
  };
  const tagsList: LocalizedTag[] = (
    (data.article_tags ?? []) as unknown as {
      tags: {
        id: string;
        name: string;
        slug: string;
        name_en?: string | null;
        slug_en?: string | null;
        name_es?: string | null;
        slug_es?: string | null;
      } | null;
    }[]
  )
    .map((x) => x.tags)
    .filter((tag): tag is LocalizedTag => tag !== null);

  if (profile?.id) cacheTags.push(`author:${profile.id}`);
  if (category?.id) cacheTags.push(`category:${category.id}`);
  cacheTags.push(...tagsList.map((tag) => `tag:${tag.id}`));
  cacheTag(...cacheTags);

  return {
    id: data.id,
    language_code: data.language_code as ArticleLanguage,
    translation_group_id: data.translation_group_id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    cover_image_url: data.cover_image_url,
    is_pinned: data.is_pinned,
    show_health_disclaimer: data.show_health_disclaimer ?? false,
    published_at: data.published_at,
    updated_at: data.updated_at,
    reading_minutes: data.reading_minutes,
    author_name: profile?.full_name ?? "",
    category_name: category ? localizedTaxonomyName(category, language) : null,
    category_slug: category ? localizedTaxonomySlug(category, language) : null,
    tags: tagsList.map((tag) => ({
      name: localizedTaxonomyName(tag, language),
      slug: localizedTaxonomySlug(tag, language),
    })),
    total_count: 1,
    content_md: data.content_md,
  };
}

export type PublishedTranslation = {
  language_code: ArticleLanguage;
  slug: string;
};

export async function getPublishedTranslations(
  translationGroupId: string,
): Promise<PublishedTranslation[]> {
  if (!isSupabaseConfigured()) {
    const article = demoArticles.find((item) => item.id === translationGroupId);
    return article ? [{ language_code: "pt-BR", slug: article.slug }] : [];
  }
  return getCachedPublishedTranslations(translationGroupId);
}

async function getCachedPublishedTranslations(
  translationGroupId: string,
): Promise<PublishedTranslation[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles, `translation-group:${translationGroupId}`);

  const supabase = createClientPublic();
  const { data, error } = await supabase
    .from("articles")
    .select("language_code,slug")
    .eq("translation_group_id", translationGroupId)
    .eq("status", "published");

  if (error) {
    console.error("article translations:", error.message);
    return [];
  }
  return (data ?? []) as PublishedTranslation[];
}

export async function hasPublishedHealthDisclaimer(
  translationGroupId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const article = demoArticles.find((item) => item.id === translationGroupId);
    return article?.show_health_disclaimer ?? false;
  }
  return getCachedHealthDisclaimer(translationGroupId);
}

async function getCachedHealthDisclaimer(
  translationGroupId: string,
): Promise<boolean> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.articles, `translation-group:${translationGroupId}`);

  const supabase = createClientPublic();
  const { data, error } = await supabase
    .from("articles")
    .select("id")
    .eq("translation_group_id", translationGroupId)
    .eq("status", "published")
    .eq("show_health_disclaimer", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("article health disclaimer:", error.message);
    return false;
  }
  return Boolean(data);
}

export type SitemapArticle = {
  slug: string;
  language_code: ArticleLanguage;
  translation_group_id: string;
  lastModified: string | null;
};

export async function getSitemapArticles(): Promise<SitemapArticle[]> {
  if (!isSupabaseConfigured())
    return demoArticles.map((a) => ({
      slug: a.slug,
      language_code: "pt-BR" as const,
      translation_group_id: a.id,
      lastModified: a.published_at,
    }));

  return getCachedSitemapArticles();
}

async function getCachedSitemapArticles(): Promise<SitemapArticle[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.sitemap,
    CACHE_TAGS.articles,
    CACHE_TAGS.categories,
    CACHE_TAGS.tags,
    CACHE_TAGS.authors,
  );

  const supabase = createClientPublic();
  const articles: SitemapArticle[] = [];
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("articles")
      .select(
        "slug, language_code, translation_group_id, updated_at, published_at",
      )
      .eq("status", "published")
      .order("slug")
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(`sitemap articles: ${error.message}`);

    articles.push(
      ...(data ?? []).map((article) => ({
        slug: article.slug,
        language_code: article.language_code as ArticleLanguage,
        translation_group_id: article.translation_group_id,
        lastModified: article.updated_at ?? article.published_at,
      })),
    );

    if (!data || data.length < pageSize) break;
  }

  return articles;
}
