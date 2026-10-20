"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FolderOpen,
  Hash,
  Heart,
  Menu,
  MessageCircle,
  Users,
  X,
} from "lucide-react";
import type { Category, Tag } from "@/lib/types";
import {
  authorPath,
  localizedTaxonomyName,
  localizedTaxonomySlug,
  type ArticleLanguage,
} from "@/lib/locales";

type Author = { name: string; slug: string; count: number };

export function SidebarLeft({
  categories,
  tags,
  authors,
  activeCategory,
  activeTag,
  language = "pt-BR",
}: {
  categories: (Category & { count: number })[];
  tags: (Tag & { count: number })[];
  authors: Author[];
  activeCategory?: string | null;
  activeTag?: string | null;
  language?: ArticleLanguage;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [mobileMenuPinned, setMobileMenuPinned] = useState(false);
  const [mobileContentHeight, setMobileContentHeight] = useState(0);
  const menuSentinelRef = useRef<HTMLSpanElement>(null);
  const sidebarContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = menuSentinelRef.current;
    if (!sentinel) return;

    const updatePinnedState = () => {
      const stickyOffset = window.matchMedia("(min-width: 768px)").matches
        ? 64
        : 0;
      const shouldPin = sentinel.getBoundingClientRect().top < stickyOffset;
      setMobileMenuPinned((pinned) =>
        pinned === shouldPin ? pinned : shouldPin,
      );
    };

    updatePinnedState();
    window.addEventListener("scroll", updatePinnedState, { passive: true });
    window.addEventListener("resize", updatePinnedState);

    return () => {
      window.removeEventListener("scroll", updatePinnedState);
      window.removeEventListener("resize", updatePinnedState);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const content = sidebarContentRef.current;
    if (!content) return;

    const updateHeight = () => setMobileContentHeight(content.scrollHeight);
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    updateHeight();

    return () => observer.disconnect();
  }, [mobileOpen]);

  const mobilePanelPinned =
    mobileMenuPinned && mobileOpen && mobileContentHeight > 0;
  const categoriesWithArticles = categories.filter(
    (category) => category.count > 0,
  );
  const tagsWithArticles = tags.filter((tag) => tag.count > 0);
  const collapsedTags = tagsWithArticles.slice(0, 10);
  if (
    activeTag &&
    !collapsedTags.some((tag) => tag.slug === activeTag) &&
    tagsWithArticles.some((tag) => tag.slug === activeTag)
  ) {
    collapsedTags[collapsedTags.length - 1] = tagsWithArticles.find(
      (tag) => tag.slug === activeTag,
    )!;
  }
  const visibleTags = showAllTags ? tagsWithArticles : collapsedTags;
  const copy =
    language === "en"
      ? {
          navigation: "Navigation and filters",
          close: "Close navigation",
          open: "Categories, tags and more",
          categories: "Categories",
          all: "All",
          tags: "Tags",
          fewer: "Show less",
          more: (count: number) => `Show more (${count})`,
          authors: "Authors",
          contribute: "Would you like to contribute to the site?",
          becomeContributor: "Become a contributor",
          donation: "Donation",
          donationDescription:
            "Would you like to support this site? Your contribution helps keep this project running.",
          discussDonation: "Ask about donating",
          contributionMessage:
            "Hello! I am interested in contributing to the Élisson Kario website.",
          donationMessage:
            "Hello Élisson, I would like to support your website with a donation.",
        }
      : language === "es"
        ? {
            navigation: "Navegación y filtros",
            close: "Cerrar navegación",
            open: "Categorías, etiquetas y más",
            categories: "Categorías",
            all: "Todas",
            tags: "Etiquetas",
            fewer: "Ver menos",
            more: (count: number) => `Ver más (${count})`,
            authors: "Autores",
            contribute: "¿Te gustaría colaborar con el sitio?",
            becomeContributor: "Hazte colaborador",
            donation: "Donación",
            donationDescription:
              "¿Te gustaría apoyar este sitio? Tu contribución ayuda a mantener este proyecto.",
            discussDonation: "Hablar sobre donaciones",
            contributionMessage:
              "¡Hola! Me interesa colaborar con el sitio web de Élisson Kario.",
            donationMessage:
              "Hola Élisson, me gustaría apoyar tu sitio web con una donación.",
          }
        : {
            navigation: "Navegação e filtros",
            close: "Fechar navegação",
            open: "Categorias, tags e mais",
            categories: "Categorias",
            all: "Todas",
            tags: "Tags",
            fewer: "Ver menos",
            more: (count: number) => `Ver mais (${count})`,
            authors: "Autores",
            contribute: "Quer contribuir com o site?",
            becomeContributor: "Torne-se um colaborador",
            donation: "Doação",
            donationDescription:
              "Gostaria de apoiar este site? Sua contribuição ajuda a manter este projeto.",
            discussDonation: "Falar sobre doação",
            contributionMessage:
              "Olá! Tenho interesse em colaborar com o site Élisson Kario.",
            donationMessage:
              "Olá Élisson, gostaria de contribuir com seu site doando uma quantia para você.",
          };
  const taxonomyHref = (kind: "category" | "tag", slug: string) =>
    language === "pt-BR"
      ? kind === "category"
        ? `/categoria/${slug}`
        : `/tag/${slug}`
      : `/${language}?${kind}=${encodeURIComponent(slug)}`;

  return (
    <aside
      className="flex flex-col gap-4 lg:gap-6"
      aria-label={copy.navigation}
    >
      <div className="relative mt-4 min-h-11 lg:hidden">
        <span
          ref={menuSentinelRef}
          aria-hidden="true"
          className="absolute left-0 top-0 h-px w-px"
        />
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="sidebar-content"
          onClick={() => setMobileOpen((open) => !open)}
          className={`${mobileMenuPinned ? "fixed inset-x-4 top-4 z-50 w-auto sm:inset-x-6 md:top-20" : "w-full"} inline-flex min-h-11 items-center justify-between rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
        >
          <span>{mobileOpen ? copy.close : copy.open}</span>
          {mobileOpen ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Menu className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        style={mobilePanelPinned ? { height: mobileContentHeight } : undefined}
        className={mobileOpen ? "" : "hidden lg:block"}
      >
        <div
          ref={sidebarContentRef}
          id="sidebar-content"
          className={`flex flex-col gap-6 ${mobileOpen ? "" : "hidden"} lg:flex ${
            mobilePanelPinned
              ? "fixed inset-x-4 top-19 z-40 max-h-[calc(100dvh-5.5rem)] overflow-y-auto sm:inset-x-6 md:top-35 md:max-h-[calc(100dvh-9.5rem)] lg:static lg:max-h-none lg:overflow-visible"
              : ""
          }`}
        >
          <nav
            aria-labelledby="nav-categorias"
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2
              id="nav-categorias"
              className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <FolderOpen className="size-4" /> {copy.categories}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link
                  href={language === "pt-BR" ? "/" : `/${language}`}
                  className={
                    !activeCategory
                      ? "block rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                      : "block rounded-md px-3 py-1.5 text-sm hover:bg-accent/60"
                  }
                >
                  {copy.all}
                </Link>
              </li>
              {categoriesWithArticles.map((c) => (
                <li key={c.id}>
                  <Link
                    href={taxonomyHref(
                      "category",
                      localizedTaxonomySlug(c, language),
                    )}
                    aria-current={
                      activeCategory === localizedTaxonomySlug(c, language)
                        ? "page"
                        : undefined
                    }
                    className={
                      (activeCategory === localizedTaxonomySlug(c, language)
                        ? "block rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                        : "block rounded-md px-3 py-1.5 text-sm hover:bg-accent/60") +
                      " flex items-center justify-between"
                    }
                  >
                    <span>{localizedTaxonomyName(c, language)}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="nav-tags"
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2
              id="nav-tags"
              className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <Hash className="size-4" /> {copy.tags}
            </h2>
            <div id="tag-list" className="flex flex-wrap gap-2">
              {visibleTags.map((t) => (
                <Link
                  key={t.id}
                  href={taxonomyHref("tag", localizedTaxonomySlug(t, language))}
                  className={
                    activeTag === localizedTaxonomySlug(t, language)
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                      : "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-primary/15"
                  }
                >
                  #{localizedTaxonomyName(t, language)}{" "}
                  <span className="opacity-60">{t.count}</span>
                </Link>
              ))}
            </div>
            {tagsWithArticles.length > 10 && (
              <button
                type="button"
                aria-expanded={showAllTags}
                aria-controls="tag-list"
                onClick={() => setShowAllTags((showing) => !showing)}
                className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {showAllTags
                  ? copy.fewer
                  : copy.more(tagsWithArticles.length - collapsedTags.length)}
              </button>
            )}
          </nav>

          {authors.length > 0 && (
            <nav
              aria-labelledby="nav-autores"
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <h2
                id="nav-autores"
                className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
              >
                <Users className="size-4" /> {copy.authors}
              </h2>
              <ul className="space-y-1">
                {authors.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={authorPath(language, a.slug)}
                      className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-accent/60"
                    >
                      <span>{a.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  {copy.contribute}
                </p>
                <Link
                  href={`https://wa.me/5542999355018?text=${encodeURIComponent(copy.contributionMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {copy.becomeContributor}
                </Link>
              </div>
            </nav>
          )}

          <section
            aria-labelledby="donation-heading"
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <h2
              id="donation-heading"
              className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <Heart className="size-4" /> {copy.donation}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {copy.donationDescription}
            </p>
            <Link
              href={`https://wa.me/5542999355018?text=${encodeURIComponent(copy.donationMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {copy.discussDonation}
            </Link>
          </section>
        </div>
      </div>
    </aside>
  );
}
