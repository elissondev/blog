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

  if (!isSupabaseConfigured()) {
    return (
      <ArticleForm
        categories={demoCategories}
        tags={demoTags}
        initialLanguage={requestedLanguage}
        translationGroupId={query.translationOf}
        mode="create"
      />
    );
  }

  const supabase = await createClientServer();
  const [{ data: cats }, { data: tags }, { data: source }] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name"),
    supabase.from("tags").select("id,name,slug").order("name"),
    query.translationOf
      ? supabase
          .from("articles")
          .select("translation_group_id")
          .eq("translation_group_id", query.translationOf)
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <ArticleForm
      categories={cats ?? []}
      tags={tags ?? []}
      initialLanguage={requestedLanguage}
      translationGroupId={source?.translation_group_id ?? null}
      mode="create"
    />
  );
}
