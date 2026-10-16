import { Suspense } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { SearchBox } from "./search-box";
import { SiteNavigation, SiteNavigationFallback } from "./site-navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-4 px-4 sm:px-6">
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

        <Suspense fallback={<SiteNavigationFallback />}>
          <SiteNavigation />
        </Suspense>

        <div className="ml-auto hidden w-56 md:block lg:w-64">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
