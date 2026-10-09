import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { Brain, Rss } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "NeuroBlog — Neurociência, saúde mental e produtividade", template: "%s | NeuroBlog" },
  description:
    "Artigos baseados em evidências sobre cérebro, sono, foco, emoções e hábitos. Escritos por especialistas, revisados pela literatura científica.",
  keywords: ["neurociência", "saúde mental", "produtividade", "sono", "foco", "hábitos", "cérebro"],
  authors: [{ name: "Equipe NeuroBlog" }],
  openGraph: {
    type: "website",
    siteName: "NeuroBlog",
    locale: "pt_BR",
    url: siteUrl,
    title: "NeuroBlog — Neurociência, saúde mental e produtividade",
    description: "Artigos baseados em evidências sobre cérebro, sono, foco e hábitos.",
  },
  twitter: { card: "summary_large_image", title: "NeuroBlog", description: "Neurociência aplicada ao dia a dia." },
  alternates: { types: { "application/rss+xml": `${siteUrl}/feed.xml` }, canonical: "/" },
  robots: { index: true, follow: true },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NeuroBlog",
  url: siteUrl,
  description: "Blog de neurociência aplicada ao dia a dia.",
  sameAs: [],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${serif.variable}`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="NeuroBlog RSS" href="/feed.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="min-h-dvh font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <SiteHeader />
        {children}
        <footer className="border-t bg-muted/30">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 font-serif font-bold">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Brain className="size-4" />
              </span>
              NeuroBlog
            </div>
            <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Início</Link>
              <Link href="/busca" className="hover:text-foreground">Busca</Link>
              <Link href="/feed.xml" className="inline-flex items-center gap-1 hover:text-foreground"><Rss className="size-3.5" /> RSS</Link>
              <Link href="/llms.txt" className="hover:text-foreground">llms.txt</Link>
              <Link href="/admin" className="hover:text-foreground">Administração</Link>
            </nav>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} NeuroBlog. Conteúdo educativo — não substitui orientação médica.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
