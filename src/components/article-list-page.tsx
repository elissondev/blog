import { Hero } from "./hero";
import { SidebarLeft } from "./sidebar-left";
import { ArticleCardComponent } from "./article-card";
import { Pagination } from "./pagination";
import {
  listArticles,
  getCategories,
  getTags,
  getAuthors,
  getRandomQuote,
} from "@/lib/data";
import type { ArticleLanguage } from "@/lib/locales";

type SP = Record<string, string | undefined>;

export async function ArticleListPage({
  searchParams,
  title,
  headingLevel = "h1",
  language = "pt-BR",
}: {
  searchParams: Promise<SP>;
  title?: string;
  headingLevel?: "h1" | "h2";
  language?: ArticleLanguage;
}) {
  const sp = await searchParams;
  const filters = {
    q: sp.q ?? null,
    category: sp.category ?? null,
    tag: sp.tag ?? null,
    author: sp.author ?? null,
    sort: (["recent", "oldest", "title", "relevance"] as const).includes(
      sp.sort as never,
    )
      ? (sp.sort as "recent" | "oldest" | "title" | "relevance")
      : undefined,
  };
  const page = Math.max(1, Number(sp.page ?? 1));
  const showHomeHero =
    !filters.category && !filters.tag && !filters.author && !filters.q;

  const copy =
    language === "en"
      ? {
          heroTitle: "Nutrition, Lifestyle & Health",
          heroDescription:
            "I'm Élisson Kario. I share studies, research, and articles that bring nutrition science into everyday life and a healthy lifestyle.",
          heroBadge: "Nutrition student · Science communication",
          articles: "All articles",
          results: (query: string) => `Results for “${query}”`,
          article: "article",
          articlesPlural: "articles",
          empty:
            "No articles found with these filters. Try clearing your search or choosing another category.",
        }
      : language === "es"
        ? {
            heroTitle: "Nutrición, estilo de vida y salud",
            heroDescription:
              "Soy Élisson Kario. Comparto estudios, investigaciones y artículos para acercar la ciencia de la nutrición a la vida cotidiana y a un estilo de vida saludable.",
            heroBadge: "Estudiante de Nutrición · Divulgación científica",
            articles: "Todos los artículos",
            results: (query: string) => `Resultados para “${query}”`,
            article: "artículo",
            articlesPlural: "artículos",
            empty:
              "No se encontraron artículos con estos filtros. Prueba a borrar la búsqueda o elegir otra categoría.",
          }
        : {
            heroTitle: "Nutrição, Estilo de Vida e Sáude",
            heroDescription:
              "Sou Élisson Kario. Compartilho estudos, pesquisas e artigos para aproximar a ciência da alimentação do dia a dia e do estilo de vida saudável.",
            heroBadge: "Estudante de Nutrição · Divulgação científica",
            articles: "Todos os artigos",
            results: (query: string) => `Resultados para “${query}”`,
            article: "artigo",
            articlesPlural: "artigos",
            empty:
              "Nenhum artigo encontrado com esses filtros. Tente limpar a busca ou escolher outra categoria.",
          };

  const [result, categories, tags, authors, quote] = await Promise.all([
    listArticles({ ...filters, page, language }),
    getCategories(language),
    getTags(language),
    getAuthors(language),
    showHomeHero && language === "pt-BR"
      ? getRandomQuote()
      : Promise.resolve(null),
  ]);
  const Heading = headingLevel;

  return (
    <>
      {showHomeHero && (
        <Hero
          title={copy.heroTitle}
          description={copy.heroDescription}
          badgeText={copy.heroBadge}
        />
      )}
      {showHomeHero && quote && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 text-center">
          <blockquote className="rounded-lg border-l-4 border-primary bg-secondary/40 px-5 py-4 sm:px-8">
            <p className="whitespace-pre-line font-serif text-lg leading-relaxed sm:text-xl">
              “{quote.text}”
            </p>
            <footer className="mt-3 text-sm font-medium text-muted-foreground text-center">
              — {quote.author}
            </footer>
          </blockquote>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" id="artigos">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <SidebarLeft
            categories={categories}
            tags={tags}
            authors={authors}
            activeCategory={filters.category}
            activeTag={filters.tag}
            language={language}
          />

          <main
            aria-label={
              title ??
              (language === "pt-BR" ? "Listagem de artigos" : copy.articles)
            }
          >
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <Heading className="font-serif text-2xl font-bold">
                {title ?? (filters.q ? copy.results(filters.q) : copy.articles)}
              </Heading>
              <p className="text-sm text-muted-foreground">
                {result.total}{" "}
                {result.total === 1 ? copy.article : copy.articlesPlural}
              </p>
            </div>

            {result.articles.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                {copy.empty}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.articles.map((a) => (
                  <ArticleCardComponent
                    key={a.id}
                    article={a}
                    showTags={false}
                    language={language}
                  />
                ))}
              </div>
            )}

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              searchParams={sp as SP}
              language={language}
            />
          </main>
        </div>
      </div>
    </>
  );
}
