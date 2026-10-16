"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calculator, Leaf, TableProperties } from "lucide-react";
import { SearchBox } from "./search-box";

export function SiteHeader() {
  const pathname = usePathname();
  const articleActive =
    pathname === "/" ||
    ["/categoria/", "/tag/", "/busca", "/artigo/", "/autor/"].some((route) =>
      pathname.startsWith(route),
    );
  const linkClass = (active: boolean) =>
    `inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
      active
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`;

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

        <nav
          aria-label="Navegação principal"
          className="order-3 -mx-4 flex w-[calc(100%+2rem)] items-center justify-around border-t px-2 py-1.5 text-sm font-medium md:order-none md:mx-0 md:w-auto md:justify-start md:gap-1 md:border-0 md:px-0 md:py-0 lg:ml-2 lg:gap-2"
        >
          <Link
            href="/#artigos"
            aria-current={articleActive ? "page" : undefined}
            className={linkClass(articleActive)}
          >
            <BookOpen className="hidden size-4 lg:block" aria-hidden="true" />
            Artigos
          </Link>
          <Link
            href="/calculadoras"
            aria-current={
              pathname.startsWith("/calculadoras") ? "page" : undefined
            }
            className={linkClass(pathname.startsWith("/calculadoras"))}
          >
            <Calculator className="hidden size-4 lg:block" aria-hidden="true" />
            Calculadoras
          </Link>
          <Link
            href="/tabelas"
            aria-current={pathname.startsWith("/tabelas") ? "page" : undefined}
            className={linkClass(pathname.startsWith("/tabelas"))}
          >
            <TableProperties
              className="hidden size-4 lg:block"
              aria-hidden="true"
            />
            Tabelas
          </Link>
        </nav>

        <div className="ml-auto hidden w-56 md:block lg:w-64">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
