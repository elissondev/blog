"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export function SearchBox({
  placeholder = "Buscar artigos…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const categoryFromPath = pathname.match(/^\/categoria\/([^/]+)$/)?.[1];
  const categorySlug =
    categoryFromPath ??
    (pathname === "/busca" ? searchParams.get("category") : null);
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [pathname, query]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    if (categorySlug) params.set("category", categorySlug);
    const queryString = params.toString();
    router.push(queryString ? `/busca?${queryString}` : "/busca");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar artigos"
        className="pl-8"
      />
    </form>
  );
}
