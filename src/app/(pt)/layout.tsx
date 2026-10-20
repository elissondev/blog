import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { CurrentYear } from "@/components/current-year";
import Link from "next/link";
import { Leaf, Rss } from "lucide-react";
import { ThemeScript } from "@/components/theme-script";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Élisson Kario — Nutrição e Ciência",
    template: "%s | Élisson Kario",
  },
  description:
    "Estudos, pesquisas e artigos sobre nutrição e alimentação, compartilhados por Élisson Kario, estudante de Nutrição.",
  keywords: [
    "nutrição",
    "alimentação",
    "estudos em nutrição",
    "pesquisa científica",
    "evidências",
  ],
  authors: [{ name: "Élisson Kario" }],
  verification: {
    google: "ZwqT0aOlZBFzZ8j9YHqRIWBzHWI7P8c1NTwoaOJN0G4",
  },
  openGraph: {
    type: "website",
    siteName: "Élisson Kario",
    locale: "pt_BR",
    url: siteUrl,
    title: "Élisson Kario — Nutrição e Ciência",
    description: "Estudos, pesquisas e artigos sobre nutrição e alimentação.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Élisson Kario",
    description: "Nutrição com ciência e contexto.",
  },
  alternates: {
    types: { "application/rss+xml": `${siteUrl}/feed.xml` },
    canonical: "/",
  },
  robots: { index: true, follow: true },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Élisson Kario",
  url: siteUrl,
  description:
    "Estudante de Nutrição que compartilha estudos, pesquisas e artigos sobre alimentação.",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Élisson Kario RSS"
          href="/feed.xml"
        />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <SiteHeader />
        {children}
        <footer className="border-t bg-muted/30">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              aria-label="Élisson Kario — início"
              className="flex items-center gap-2 font-serif font-bold hover:text-primary"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="size-4" />
              </span>
              Élisson Kario
            </Link>
            <nav
              aria-label="Rodapé"
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground">
                Início
              </Link>
              <Link
                href="/feed.xml"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Rss className="size-3.5" /> RSS
              </Link>
            </nav>
            <p className="text-xs text-muted-foreground">
              © <CurrentYear /> Élisson Kario. Conteúdo educativo; não substitui
              orientação individual de um profissional de saúde.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
