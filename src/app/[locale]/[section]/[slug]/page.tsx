import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getAuthors,
  getPublishedTranslations,
} from "@/lib/data";
import { authorPath, isLocale, LOCALE_CONFIG } from "@/lib/locales";
import { LocalizedArticlePage } from "@/components/localized-article-page";
import { LocalizedAuthorPage } from "@/components/localized-author-page";
import { authorSlug } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; section: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export const instant = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, section, slug } = await params;
  if (!isLocale(locale)) return {};

  if (section === LOCALE_CONFIG[locale].authorSegment) {
    const authors = await getAuthors();
    const author = authors.find((item) => item.slug === authorSlug(slug));
    if (!author)
      return {
        title: locale === "en" ? "Author not found" : "Autor no encontrado",
        robots: { index: false },
      };
    const description =
      (locale === "en" ? author.description_en : author.description_es) ||
      (locale === "en"
        ? `Articles published by ${author.name} on Élisson Kario's website.`
        : `Artículos publicados por ${author.name} en el sitio de Élisson Kario.`);
    const url = `${siteUrl}${authorPath(locale, author.slug)}`;
    return {
      title:
        locale === "en"
          ? `Articles by ${author.name}`
          : `Artículos de ${author.name}`,
      description,
      alternates: { canonical: url },
      openGraph: { title: author.name, description, url },
    };
  }

  if (section !== LOCALE_CONFIG[locale].articleSegment) return {};

  const article = await getArticleBySlug(slug, locale);
  if (!article)
    return {
      title: locale === "en" ? "Article not found" : "Artículo no encontrado",
    };

  const translations = await getPublishedTranslations(
    article.translation_group_id,
  );
  const languages = Object.fromEntries(
    translations.map((translation) => [
      translation.language_code,
      `${siteUrl}${articlePathForTranslation(translation.language_code, translation.slug)}`,
    ]),
  );
  const portuguese = translations.find(
    (translation) => translation.language_code === "pt-BR",
  );
  if (portuguese)
    languages["x-default"] = articlePathForTranslation(
      "pt-BR",
      portuguese.slug,
    );

  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author_name }],
    alternates: {
      canonical: articlePathForTranslation(locale, article.slug),
      languages,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: articlePathForTranslation(locale, article.slug),
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? article.published_at ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
      locale: locale === "en" ? "en_US" : "es_ES",
    },
  };
}

function articlePathForTranslation(
  language: "pt-BR" | "en" | "es",
  slug: string,
) {
  if (language === "pt-BR") return `/artigo/${slug}`;
  return `/${language}/${LOCALE_CONFIG[language].articleSegment}/${slug}`;
}

export default async function LocalizedArticleRoute({
  params,
  searchParams,
}: Props) {
  const { locale, section, slug } = await params;
  if (!isLocale(locale)) notFound();
  if (section === LOCALE_CONFIG[locale].authorSegment)
    return (
      <LocalizedAuthorPage
        locale={locale}
        slug={slug}
        searchParams={searchParams}
      />
    );
  if (section === LOCALE_CONFIG[locale].articleSegment)
    return <LocalizedArticlePage locale={locale} slug={slug} />;
  notFound();
}
