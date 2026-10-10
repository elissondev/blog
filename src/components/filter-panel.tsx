"use client";

import { useRouter, usePathname } from "next/navigation";
import { SearchBox } from "./search-box";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type ActiveFilters = { q?: string | null; sort?: string | null };

export function FilterPanel({ filters }: { filters: ActiveFilters }) {
  const router = useRouter();
  const pathname = usePathname();

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-end"
      aria-label="Busca e ordenação"
    >
      <div className="min-w-0 flex-1">
        <Label className="mb-1.5 text-xs">Busca</Label>
        <SearchBox placeholder="Buscar por título ou conteúdo…" />
      </div>

      <div className="w-full sm:w-56 sm:shrink-0">
        <Label htmlFor="f-sort" className="mb-1.5 text-xs">
          Ordenar por
        </Label>
        <Select
          value={filters.sort ?? "recent"}
          onValueChange={(v) =>
            setParam("sort", v === "recent" ? undefined : v)
          }
        >
          <SelectTrigger id="f-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="title">Título (A–Z)</SelectItem>
            {filters.q ? (
              <SelectItem value="relevance">Relevância</SelectItem>
            ) : null}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
