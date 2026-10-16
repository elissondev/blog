"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Calculator, Menu, TableProperties, X } from "lucide-react";

const navClass =
  "absolute left-0 top-full z-50 w-full flex-col items-stretch border-t bg-background px-4 py-2 text-sm font-medium shadow-md md:static md:order-none md:flex md:w-auto md:flex-row md:items-center md:justify-start md:gap-1 md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none lg:ml-2 lg:gap-2";

function NavigationLinks({ pathname }: { pathname?: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <button
        type="button"
        className="order-2 ml-auto inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        aria-controls="site-navigation-links"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>
      <nav
        id="site-navigation-links"
        aria-label="Navegação principal"
        className={`${navClass} ${isOpen ? "flex" : "hidden"} md:flex`}
      >
        <Link
          href="/#artigos"
          aria-current={articleActive ? "page" : undefined}
          className={linkClass(articleActive)}
          onClick={() => setIsOpen(false)}
        >
          <BookOpen className="hidden size-4 lg:block" aria-hidden="true" />
          Artigos
        </Link>
        <Link
          href="/calculadoras"
          aria-current={calculatorsActive ? "page" : undefined}
          className={linkClass(calculatorsActive)}
          onClick={() => setIsOpen(false)}
        >
          <Calculator className="hidden size-4 lg:block" aria-hidden="true" />
          Calculadoras
        </Link>
        <Link
          href="/tabelas"
          aria-current={tablesActive ? "page" : undefined}
          className={linkClass(tablesActive)}
          onClick={() => setIsOpen(false)}
        >
          <TableProperties
            className="hidden size-4 lg:block"
            aria-hidden="true"
          />
          Tabelas
        </Link>
      </nav>
    </>
  );
}

export function SiteNavigation() {
  return <NavigationLinks pathname={usePathname()} />;
}

export function SiteNavigationFallback() {
  return <NavigationLinks />;
}
