"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calculator, TableProperties } from "lucide-react";

const navClass =
  "order-3 -mx-4 flex w-[calc(100%+2rem)] items-center justify-around border-t px-2 py-1.5 text-sm font-medium md:order-none md:mx-0 md:w-auto md:justify-start md:gap-1 md:border-0 md:px-0 md:py-0 lg:ml-2 lg:gap-2";

function NavigationLinks({ pathname }: { pathname?: string }) {
  const articleActive =
    pathname === "/" ||
    ["/categoria/", "/tag/", "/busca", "/artigo/", "/autor/"].some((route) =>
      pathname?.startsWith(route),
    );
  const calculatorsActive = pathname?.startsWith("/calculadoras") ?? false;
  const tablesActive = pathname?.startsWith("/tabelas") ?? false;
  const linkClass = (active: boolean) =>
    `inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
      active
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`;

  return (
    <nav aria-label="Navegação principal" className={navClass}>
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
        aria-current={calculatorsActive ? "page" : undefined}
        className={linkClass(calculatorsActive)}
      >
        <Calculator className="hidden size-4 lg:block" aria-hidden="true" />
        Calculadoras
      </Link>
      <Link
        href="/tabelas"
        aria-current={tablesActive ? "page" : undefined}
        className={linkClass(tablesActive)}
      >
        <TableProperties
          className="hidden size-4 lg:block"
          aria-hidden="true"
        />
        Tabelas
      </Link>
    </nav>
  );
}

export function SiteNavigation() {
  return <NavigationLinks pathname={usePathname()} />;
}

export function SiteNavigationFallback() {
  return <NavigationLinks />;
}
