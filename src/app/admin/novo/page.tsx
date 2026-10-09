import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/article-form";
import { demoCategories, demoTags } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  if (!isSupabaseConfigured()) {
    return <ArticleForm categories={demoCategories} tags={demoTags} mode="create" />;
  }

  const supabase = await createClientServer();
  const [{ data: cats }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name"),
    supabase.from("tags").select("id,name,slug").order("name"),
  ]);

  return <ArticleForm categories={cats ?? []} tags={tags ?? []} mode="create" />;
}
