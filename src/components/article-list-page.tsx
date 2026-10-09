import { Hero } from "./hero";
import { SidebarLeft } from "./sidebar-left";
import { FilterPanel } from "./filter-panel";
import { ArticleCardComponent } from "./article-card";
import { Pagination } from "./pagination";
import { listArticles, getCategories, getTags, getAuthors } from "@/lib/data";

type SP = Record<string, string | undefined>;

export async function ArticleListPage({ searchParams, title }: { searchParams: Promise<SP>; title?: string }) {
  const sp = await searchParams;
  const filters = {
    q: sp.q ?? null,
    category: sp.category ?? null,
    tag: sp.tag ?? null,
    author: sp.author ?? null,
    sort: (["recent","oldest","title","relevance"] as const).includes(sp.sort as never) ? (sp.sort as "recent"|"oldest"|"title"|"relevance") : undefined,
  };
  const page = Math.max(1, Number(sp.page ?? 1));

  const [result, categories, tags, authors] = await Promise.all([
    listArticles({ ...filters, page }),
    getCategories(),
    getTags(),
    getAuthors(),
  ]);

  return (
    <>
      {!filters.category && !filters.tag && !filters.author && !filters.q && <Hero />}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" id="artigos">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
          <SidebarLeft
            categories={categories}
            tags={tags}
            authors={authors}
            activeCategory={filters.category}
            activeTag={filters.tag}
          />

          <main aria-label={title ?? "Listagem de artigos"}>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h1 className="font-serif text-2xl font-bold">
                {title ?? (filters.q ? `Resultados para “${filters.q}”` : "Todos os artigos")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {result.total} {result.total === 1 ? "artigo" : "artigos"}
              </p>
            </div>

            {result.articles.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                Nenhum artigo encontrado com esses filtros. Tente limpar a busca ou escolher outra categoria.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.articles.map((a) => (
                  <ArticleCardComponent key={a.id} article={a} />
                ))}
              </div>
            )}

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={sp as SP}
            />
          </main>

          <FilterPanel
            filters={filters}
            categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
            tags={tags.map((t) => ({ name: t.name, slug: t.slug }))}
            authors={authors}
          />
        </div>
      </div>
    </>
  );
}
