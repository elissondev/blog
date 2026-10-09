"use client";

import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchBox } from "./search-box";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

export type ActiveFilters = { q?: string | null; category?: string | null; tag?: string | null; author?: string | null; sort?: string | null };

export function FilterPanel({
  filters,
  categories,
  tags,
  authors,
}: {
  filters: ActiveFilters;
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
  authors: { name: string; slug: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = Boolean(filters.q || filters.category || filters.tag || filters.author);

  return (
    <aside className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm" aria-label="Busca e filtros">
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <SlidersHorizontal className="size-4" /> Busca e filtros
        </h2>
        <SearchBox placeholder="Buscar por título ou conteúdo…" />
      </div>

      <div className="grid gap-3">
        <div>
          <Label htmlFor="f-cat" className="mb-1.5 text-xs">Categoria</Label>
          <Select value={filters.category ?? "__all__"} onValueChange={(v) => setParam("category", v === "__all__" ? undefined : v)}>
            <SelectTrigger id="f-cat"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as categorias</SelectItem>
              {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="f-tag" className="mb-1.5 text-xs">Tag</Label>
          <Select value={filters.tag ?? "__all__"} onValueChange={(v) => setParam("tag", v === "__all__" ? undefined : v)}>
            <SelectTrigger id="f-tag"><SelectValue placeholder="Todas as tags" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as tags</SelectItem>
              {tags.map((t) => <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="f-aut" className="mb-1.5 text-xs">Autor</Label>
          <Select value={filters.author ?? "__all__"} onValueChange={(v) => setParam("author", v === "__all__" ? undefined : v)}>
            <SelectTrigger id="f-aut"><SelectValue placeholder="Todos os autores" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos os autores</SelectItem>
              {authors.map((a) => <SelectItem key={a.slug} value={a.slug}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="f-sort" className="mb-1.5 text-xs">Ordenar por</Label>
          <Select value={filters.sort ?? "recent"} onValueChange={(v) => setParam("sort", v === "recent" ? undefined : v)}>
            <SelectTrigger id="f-sort"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
              <SelectItem value="title">Título (A–Z)</SelectItem>
              {filters.q ? <SelectItem value="relevance">Relevância</SelectItem> : null}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="outline" size="sm" onClick={() => router.push(pathname)}>
            <X className="size-4" /> Limpar filtros
          </Button>
        )}
      </div>
    </aside>
  );
}
