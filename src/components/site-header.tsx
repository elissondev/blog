import { Suspense } from "react";
import Link from "next/link";
import { Brain, Menu } from "lucide-react";
import { SearchBox } from "./search-box";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/categoria/neurociencia", label: "Neurociência" },
  { href: "/categoria/saude-mental", label: "Saúde Mental" },
  { href: "/categoria/produtividade", label: "Produtividade" },
  { href: "/categoria/sono", label: "Sono" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold" aria-label="NeuroBlog — início">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="size-5" />
          </span>
          Neuro<span className="text-primary">Blog</span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-1 ml-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block w-56 lg:w-64">
          <Suspense fallback={null}><SearchBox /></Suspense>
        </div>

        <details className="lg:hidden relative group">
          <summary className="list-none flex size-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent">
            <Menu className="size-5" />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border bg-popover p-2 shadow-lg">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
