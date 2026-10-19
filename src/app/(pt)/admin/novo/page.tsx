import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/article-form";
import { demoCategories, demoTags } from "@/lib/demo-data";
import { isArticleLanguage } from "@/lib/locales";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ translationOf?: string; language?: string }>;
}) {
  const query = await searchParams;
  const requestedLanguage =
    query.language && isArticleLanguage(query.language)
      ? query.language
      : "pt-BR";
  const initialLanguage = query.translationOf ? requestedLanguage : "pt-BR";

  if (!isSupabaseConfigured()) {
    return (
      <ArticleForm
        categories={demoCategories}
        tags={demoTags}
        initialLanguage={initialLanguage}
        translationGroupId={query.translationOf}
        mode="create"
      />
    );
  }

  const supabase = await createClientServer();
  const [{ data: cats }, { data: tags }, { data: sources }] = await Promise.all(
    [
      supabase.from("categories").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
      query.translationOf
        ? supabase
            .from("articles")
            .select(
              "id,translation_group_id,language_code,cover_image_url,category_id,article_tags(tag_id)",
            )
            .eq("translation_group_id", query.translationOf)
        : Promise.resolve({ data: [] }),
    ],
  );

  const sourceRows = sources ?? [];
  const source =
    sourceRows.find((row) => row.language_code === "pt-BR") ?? sourceRows[0];
  const coverSource = sourceRows.find((row) => row.cover_image_url) ?? source;
  const initialTagIds = (
    (source?.article_tags ?? []) as { tag_id: string }[]
  ).map((tag) => tag.tag_id);

  return (
    <ArticleForm
      categories={cats ?? []}
      tags={tags ?? []}
      initialCoverUrl={coverSource?.cover_image_url ?? null}
      initialCategoryId={source?.category_id ?? null}
      initialTagIds={initialTagIds}
      initialLanguage={source ? initialLanguage : "pt-BR"}
      translationGroupId={source?.translation_group_id ?? null}
      mode="create"
    />
  );
}
