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
import type { ArticleCard } from "@/lib/types";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import { articlePath, type ArticleLanguage } from "@/lib/locales";

type Row = Pick<
  ArticleCard,
  | "id"
  | "title"
  | "slug"
  | "published_at"
  | "category_name"
  | "author_name"
  | "is_pinned"
> & { status: "draft" | "published"; language_code: ArticleLanguage };

export default async function AdminDashboardPage() {
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
      status: "published" as const,
    }));
    counts = { total: rows.length, published: rows.length, drafts: 0 };
  } else {
    const supabase = await createClientServer();
    const { data } = await supabase
      .from("articles")
      .select(
        "id,title,slug,status,published_at,is_pinned,language_code,category_id,categories(name),author_id,profiles(full_name)",
      )
      .order("updated_at", { ascending: false })
      .limit(200);
    rows = (data ?? []).map((r) => {
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
        status: r.status as "draft" | "published",
      };
    });
    counts = {
      total: rows.length,
      published: rows.filter((r) => r.status === "published").length,
      drafts: rows.filter((r) => r.status === "draft").length,
    };
  }

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
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="max-w-72 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {r.is_pinned && (
                      <Pin
                        className="size-4 shrink-0 text-primary"
                        aria-label="Artigo fixado"
                      />
                    )}
                    <Link
                      href={`/admin/artigo/${r.id}/editar`}
                      className="font-medium hover:underline"
                    >
                      {r.title}
                    </Link>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {r.language_code}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {articlePath(r.language_code, r.slug)}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {r.category_name ?? "—"}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {r.author_name}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={r.status === "published" ? "default" : "secondary"}
                  >
                    {r.status === "published" ? (
                      <>
                        <Eye className="mr-1 size-3" />
                        Publicado
                      </>
                    ) : (
                      <>
                        <PenLine className="mr-1 size-3" />
                        Rascunho
                      </>
                    )}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 whitespace-nowrap text-muted-foreground lg:table-cell">
                  {formatDate(r.published_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      asChild
                      aria-label={`Editar ${r.title}`}
                    >
                      <Link href={`/admin/artigo/${r.id}/editar`}>
                        <PenLine className="size-4" />
                      </Link>
                    </Button>
                    {r.status === "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        asChild
                        aria-label={`Ver ${r.title}`}
                      >
                        <Link
                          href={articlePath(r.language_code, r.slug)}
                          target="_blank"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                    )}
                    {isSupabaseConfigured() && (
                      <DeleteArticleButton id={r.id} title={r.title} />
                    )}
                  </div>
                </td>
              </tr>
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
    </div>
  );
}
