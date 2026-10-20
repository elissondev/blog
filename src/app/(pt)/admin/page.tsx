import Link from "next/link";
import { PlusCircle, ExternalLink, PenLine, Eye, Pin } from "lucide-react";
import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { demoArticles } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import type { ArticleCard } from "@/lib/types";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import {
  ARTICLE_LANGUAGE_ORDER,
  LOCALE_CONFIG,
  articlePath,
  type ArticleLanguage,
} from "@/lib/locales";

const PAGE_SIZE = 20;

type Row = Pick<
  ArticleCard,
  | "id"
  | "title"
  | "slug"
  | "published_at"
  | "category_name"
  | "author_name"
  | "is_pinned"
> & {
  status: "draft" | "published";
  language_code: ArticleLanguage;
  translationLanguages: ArticleLanguage[];
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const requestedPage = Math.max(
    1,
    Number.parseInt(query.page ?? "1", 10) || 1,
  );
  let page = requestedPage;
  let rows: Row[] = [];
  let counts = { total: 0, published: 0, drafts: 0 };

  if (!isSupabaseConfigured()) {
    rows = demoArticles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      published_at: a.published_at,
      category_name: a.category_name,
      author_name: a.author_name,
      is_pinned: a.is_pinned ?? false,
      language_code: "pt-BR" as const,
      translationLanguages: [],
      status: "published" as const,
    }));
    counts = {
      total: rows.length,
      published: rows.filter((row) => row.status === "published").length,
      drafts: rows.filter((row) => row.status === "draft").length,
    };
  } else {
    const supabase = await createClientServer();
    const [{ count: total }, { count: published }, { count: drafts }] =
      await Promise.all([
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("language_code", "pt-BR"),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("language_code", "pt-BR")
          .eq("status", "published"),
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("language_code", "pt-BR")
          .eq("status", "draft"),
      ]);
    counts = {
      total: total ?? 0,
      published: published ?? 0,
      drafts: drafts ?? 0,
    };
    page = Math.min(
      requestedPage,
      Math.max(1, Math.ceil(counts.total / PAGE_SIZE)),
    );

    const { data } = await supabase
      .from("articles")
      .select(
        "id,title,slug,status,published_at,is_pinned,language_code,translation_group_id,category_id,categories(name),author_id,profiles(full_name)",
      )
      .eq("language_code", "pt-BR")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const parentRows = data ?? [];
    const groupIds = parentRows.map((row) => row.translation_group_id);
    const translationsByGroup = new Map<string, ArticleLanguage[]>();

    if (groupIds.length > 0) {
      const { data: translations } = await supabase
        .from("articles")
        .select("translation_group_id,language_code")
        .in("translation_group_id", groupIds)
        .neq("language_code", "pt-BR");

      for (const translation of translations ?? []) {
        const languages =
          translationsByGroup.get(translation.translation_group_id) ?? [];
        const language = translation.language_code as ArticleLanguage;
        if (!languages.includes(language)) languages.push(language);
        translationsByGroup.set(translation.translation_group_id, languages);
      }
    }

    rows = parentRows.map((r) => {
      const cat = (r as unknown as { categories: { name: string } | null })
        .categories;
      const prof = (r as unknown as { profiles: { full_name: string } | null })
        .profiles;
      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        published_at: r.published_at,
        category_name: cat?.name ?? null,
        author_name: prof?.full_name ?? "—",
        is_pinned: r.is_pinned ?? false,
        language_code: r.language_code as ArticleLanguage,
        translationLanguages: (
          translationsByGroup.get(r.translation_group_id) ?? []
        ).sort(
          (a, b) =>
            ARTICLE_LANGUAGE_ORDER.indexOf(a) -
            ARTICLE_LANGUAGE_ORDER.indexOf(b),
        ),
        status: r.status as "draft" | "published",
      };
    });
  }

  const totalPages = Math.ceil(counts.total / PAGE_SIZE);
  if (!isSupabaseConfigured()) {
    page = Math.min(requestedPage, Math.max(1, totalPages));
  }
  const sortedRows = [...rows].sort(
    (a, b) => +new Date(b.published_at ?? 0) - +new Date(a.published_at ?? 0),
  );
  const pageRows = isSupabaseConfigured()
    ? sortedRows
    : sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Artigos</h1>
          <p className="text-sm text-muted-foreground">
            {counts.total} no total · {counts.published} publicados ·{" "}
            {counts.drafts} rascunhos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/novo">
            <PlusCircle className="size-4" /> Novo artigo
          </Link>
        </Button>
      </div>

      {!isSupabaseConfigured() && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Modo demonstração: sem credenciais do Supabase, as alterações não são
          persistidas. Configure o <code>.env.local</code> para ativar o painel
          completo.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-medium">
                Título
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 font-medium sm:table-cell"
              >
                Categoria
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 font-medium md:table-cell"
              >
                Autor
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th
                scope="col"
                className="hidden px-4 py-3 font-medium lg:table-cell"
              >
                Data
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pageRows.map((row) => (
              <AdminArticleRow key={row.id} row={row} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Nenhum artigo ainda.{" "}
                  <Link href="/admin/novo" className="underline">
                    Crie o primeiro →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} searchParams={query} />
    </div>
  );
}

function AdminArticleRow({ row }: { row: Row }) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="max-w-72 px-4 py-3">
        <div className="flex items-center gap-2">
          {row.is_pinned && (
            <Pin
              className="size-4 shrink-0 text-primary"
              aria-label="Artigo fixado"
            />
          )}
          <Link
            href={`/admin/artigo/${row.id}/editar`}
            className="font-medium hover:underline"
          >
            {row.title}
          </Link>
          {row.translationLanguages.map((language) => (
            <Badge
              key={language}
              variant="outline"
              className="shrink-0 text-[10px]"
              title={LOCALE_CONFIG[language].label}
              aria-label={`Tradução disponível: ${LOCALE_CONFIG[language].label}`}
            >
              {LOCALE_CONFIG[language].flag}
            </Badge>
          ))}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {articlePath(row.language_code, row.slug)}
        </p>
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
        {row.category_name ?? "—"}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
        {row.author_name}
      </td>
      <td className="px-4 py-3">
        <Badge variant={row.status === "published" ? "default" : "secondary"}>
          {row.status === "published" ? (
            <>
              <Eye className="mr-1 size-3" /> Publicado
            </>
          ) : (
            <>
              <PenLine className="mr-1 size-3" /> Rascunho
            </>
          )}
        </Badge>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">
        {formatDate(row.published_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            asChild
            aria-label={`Editar ${row.title}`}
          >
            <Link href={`/admin/artigo/${row.id}/editar`}>
              <PenLine className="size-4" />
            </Link>
          </Button>
          {row.status === "published" && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              asChild
              aria-label={`Ver ${row.title}`}
            >
              <Link
                href={articlePath(row.language_code, row.slug)}
                target="_blank"
              >
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          )}
          {isSupabaseConfigured() && (
            <DeleteArticleButton id={row.id} title={row.title} />
          )}
        </div>
      </td>
    </tr>
  );
}
