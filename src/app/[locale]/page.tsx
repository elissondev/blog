import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleListPage } from "@/components/article-list-page";
import { HomeLoading } from "@/components/home-loading";
import { isLocale } from "@/lib/locales";

export const instant = false;

const pageCopy = {
  en: {
    title: "Nutrition, Lifestyle & Health",
    description:
      "Studies, research, and articles about nutrition and healthy living.",
  },
  es: {
    title: "Nutrición, estilo de vida y salud",
    description:
      "Estudios, investigaciones y artículos sobre nutrición y vida saludable.",
  },
} as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: pageCopy[locale].title,
    description: pageCopy[locale].description,
    alternates: { canonical: `/${locale}` },
  };
}

export default async function LocalizedHomePage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <Suspense fallback={<HomeLoading language={locale} />}>
      <ArticleListPage searchParams={searchParams} language={locale} />
    </Suspense>
  );
}
