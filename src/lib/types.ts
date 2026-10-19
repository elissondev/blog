import type { ArticleLanguage } from "./locales";

export type PostTag = { name: string; slug: string };

export type ArticleCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  is_pinned?: boolean;
  show_health_disclaimer?: boolean;
  published_at: string | null;
  updated_at?: string | null;
  reading_minutes: number;
  author_name: string;
  category_name: string | null;
  category_slug: string | null;
  tags: PostTag[];
  total_count: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  name_en?: string | null;
  slug_en?: string | null;
  description_en?: string | null;
  name_es?: string | null;
  slug_es?: string | null;
  description_es?: string | null;
};
export type Tag = {
  id: string;
  name: string;
  slug: string;
  name_en?: string | null;
  slug_en?: string | null;
  name_es?: string | null;
  slug_es?: string | null;
};
export type InspirationalQuote = {
  id: string;
  text: string;
  author: string;
  created_at?: string;
};

export type ArticleFull = {
  id: string;
  language_code?: ArticleLanguage;
  translation_group_id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string | null;
  is_pinned?: boolean;
  show_health_disclaimer?: boolean;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reading_minutes: number;
  category_id: string | null;
  categories: { name: string; slug: string } | null;
  profiles: { id: string; full_name: string; avatar_url: string | null } | null;
  article_tags: { tags: { id: string; name: string; slug: string } }[];
};

export type EnvFlags = { hasSupabase: boolean };
