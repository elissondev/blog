"use client";

import Link from "next/link";
import { useState } from "react";
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

type Author = { name: string; slug: string; count: number };

export function SidebarLeft({
  categories,
  tags,
  authors,
  activeCategory,
  activeTag,
}: {
  categories: (Category & { count: number })[];
  tags: (Tag & { count: number })[];
  authors: Author[];
  activeCategory?: string | null;
  activeTag?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside
      className="flex flex-col gap-4 lg:gap-6"
      aria-label="Navegação e filtros"
    >
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="sidebar-content"
        onClick={() => setMobileOpen((open) => !open)}
        className="inline-flex min-h-11 w-full items-center justify-between rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
      >
        <span>
          {mobileOpen ? "Fechar navegação" : "Categorias, tags e mais"}
        </span>
        {mobileOpen ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <Menu className="size-4" aria-hidden="true" />
        )}
      </button>

      <div
        id="sidebar-content"
        className={`flex flex-col gap-6 ${mobileOpen ? "" : "hidden"} lg:flex`}
      >
        <nav
          aria-labelledby="nav-categorias"
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <h2
            id="nav-categorias"
            className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <FolderOpen className="size-4" /> Categorias
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className={
                  !activeCategory
                    ? "block rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                    : "block rounded-md px-3 py-1.5 text-sm hover:bg-accent/60"
                }
              >
                Todas
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categoria/${c.slug}`}
                  aria-current={activeCategory === c.slug ? "page" : undefined}
                  className={
                    (activeCategory === c.slug
                      ? "block rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
                      : "block rounded-md px-3 py-1.5 text-sm hover:bg-accent/60") +
                    " flex items-center justify-between"
                  }
                >
                  <span>{c.name}</span>
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
            <Hash className="size-4" /> Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t.id}
                href={`/tag/${t.slug}`}
                className={
                  activeTag === t.slug
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-primary/15"
                }
              >
                #{t.name} <span className="opacity-60">{t.count}</span>
              </Link>
            ))}
          </div>
        </nav>

        {authors.length > 0 && (
          <nav
            aria-labelledby="nav-autores"
            className={`rounded-xl border bg-card p-5 shadow-sm ${mobileOpen ? "" : "hidden xl:block"}`}
          >
            <h2
              id="nav-autores"
              className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <Users className="size-4" /> Autores
            </h2>
            <ul className="space-y-1">
              {authors.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/autor/${a.slug}`}
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
                Quer contribuir com o site?
              </p>
              <Link
                href={`https://wa.me/5542999355018?text=${encodeURIComponent("Olá! Tenho interesse em colaborar com o site Élisson Kario.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Torne-se um colaborador
              </Link>
            </div>
          </nav>
        )}

        <section
          aria-labelledby="donation-heading"
          className={`rounded-xl border bg-card p-5 shadow-sm ${mobileOpen ? "" : "hidden xl:block"}`}
        >
          <h2
            id="donation-heading"
            className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Heart className="size-4" /> Doação
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Gostaria de apoiar este site? Sua contribuição ajuda a manter este
            projeto.
          </p>
          <Link
            href={`https://wa.me/5542999355018?text=${encodeURIComponent("Olá Élisson, gostaria de contribuir com seu site doando uma quantia para você.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Falar sobre doação
          </Link>
        </section>
      </div>
    </aside>
  );
}
