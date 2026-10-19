export const SUPPORTED_LOCALES = ["en", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type ArticleLanguage = "pt-BR" | Locale;

export const LOCALE_CONFIG: Record<
  ArticleLanguage,
  { htmlLang: string; articleSegment: string; label: string }
> = {
  "pt-BR": { htmlLang: "pt-BR", articleSegment: "artigo", label: "Português" },
  en: { htmlLang: "en", articleSegment: "article", label: "English" },
  es: { htmlLang: "es", articleSegment: "articulo", label: "Español" },
};

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function isArticleLanguage(value: string): value is ArticleLanguage {
  return value === "pt-BR" || isLocale(value);
}

export function articlePath(language: ArticleLanguage, slug: string): string {
  const config = LOCALE_CONFIG[language];
  return language === "pt-BR"
    ? `/${config.articleSegment}/${slug}`
    : `/${language}/${config.articleSegment}/${slug}`;
}

export function localizedTaxonomyName(
  item: { name: string; name_en?: string | null; name_es?: string | null },
  language: ArticleLanguage,
): string {
  if (language === "en") return item.name_en || item.name;
  if (language === "es") return item.name_es || item.name;
  return item.name;
}

export function localizedTaxonomySlug(
  item: { slug: string; slug_en?: string | null; slug_es?: string | null },
  language: ArticleLanguage,
): string {
  if (language === "en") return item.slug_en || item.slug;
  if (language === "es") return item.slug_es || item.slug;
  return item.slug;
}
