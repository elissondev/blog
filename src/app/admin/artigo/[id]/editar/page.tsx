import { redirect } from "next/navigation";
import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/article-form";
import { demoCategories, demoTags } from "@/lib/demo-data";
import type { ArticleFull } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    const article: ArticleFull = {
      id: "d1", title: "Como o sono profundo consolida a memória", slug: "sono-profundo-consolida-memoria",
      excerpt: "Demo — configure o Supabase para persistir alterações.", content_md: "", cover_image_url: null,
      status: "published", published_at: null, created_at: "", updated_at: "", reading_minutes: 7,
      category_id: "c1", categories: null, profiles: null, article_tags: [],
    };
    return <ArticleForm article={article} categories={demoCategories} tags={demoTags} mode="edit" />;
  }

  const supabase = await createClientServer();
  // getSession() é local (cookies) — o middleware já garantiu/renovou a sessão
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect(`/admin/login?next=/admin/artigo/${id}/editar`);

  const [{ data: article }, { data: cats }, { data: tags }] = await Promise.all([
    supabase.from("articles").select("*, categories(id,name,slug), profiles(id,full_name,avatar_url), article_tags(tags(id,name,slug))").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ]);

  if (!article) redirect("/admin");

  const linkedTags = ((article.article_tags ?? []) as unknown as { tags: { id: string; name: string; slug: string } }[])
    .map((x) => x.tags)
    .filter(Boolean);

  return (
    <ArticleForm
      article={{ ...article, categories: article.categories, profiles: article.profiles }}
      categories={cats ?? []}
      tags={(tags ?? []).map((t) => ({ id: t.id, name: t.name, slug: t.slug }))}
      initialTagIds={linkedTags.map((t) => t.id)}
      mode="edit"
    />
  );
}
