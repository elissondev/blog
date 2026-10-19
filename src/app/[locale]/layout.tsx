import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Inter, Source_Serif_4 } from "next/font/google";
import "../(pt)/globals.css";
import { LOCALE_CONFIG, isLocale, SUPPORTED_LOCALES } from "@/lib/locales";
import { Leaf, Rss } from "lucide-react";
import { CurrentYear } from "@/components/current-year";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const googleAnalyticsId = "G-TFYWN7HN6H";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const isEnglish = locale === "en";
  const title = isEnglish
    ? "Élisson Kario — Nutrition and Science"
    : "Élisson Kario — Nutrición y Ciencia";
  const description = isEnglish
    ? "Research and evidence-based articles about nutrition and food."
    : "Investigaciones y artículos basados en evidencia sobre nutrición y alimentación.";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | Élisson Kario` },
    description,
    openGraph: {
      type: "website",
      siteName: "Élisson Kario",
      locale: isEnglish ? "en_US" : "es_ES",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const isEnglish = locale === "en";

  return (
    <html
      lang={LOCALE_CONFIG[locale].htmlLang}
      className={`${inter.variable} ${serif.variable}`}
    >
      <head>
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="min-h-dvh font-sans">
        <Script id="google-analytics-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <header className="relative z-40 w-full border-b bg-background/90">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif text-xl font-bold"
              aria-label="Élisson Kario"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="size-4" aria-hidden="true" />
              </span>
              Élisson Kario
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isEnglish ? "Português" : "Portugués"}
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-t bg-muted/30">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif font-bold"
            >
              <Leaf className="size-4 text-primary" aria-hidden="true" />
              Élisson Kario
            </Link>
            <Link
              href="/feed.xml"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground"
            >
              <Rss className="size-3.5" aria-hidden="true" /> RSS
            </Link>
            <p className="text-xs text-muted-foreground">
              © <CurrentYear /> Élisson Kario.{" "}
              {isEnglish
                ? "Educational content; not a substitute for individual professional advice."
                : "Contenido educativo; no sustituye la orientación individual de un profesional de salud."}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
