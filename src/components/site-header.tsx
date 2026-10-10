import { Suspense } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { SearchBox } from "./search-box";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold"
          aria-label="Élisson Kario — início"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          Élisson Kario
        </Link>

        <nav aria-label="Navegação principal" className="hidden lg:flex" />

        <div className="ml-auto hidden md:block w-56 lg:w-64">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
