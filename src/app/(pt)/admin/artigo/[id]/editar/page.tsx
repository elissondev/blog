import { redirect } from "next/navigation";
import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/article-form";
import { demoCategories, demoTags } from "@/lib/demo-data";
import type { ArticleFull } from "@/lib/types";
import type { ArticleLanguage } from "@/lib/locales";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    const article: ArticleFull = {
      id: "d1",
      title: "Como o sono profundo consolida a memória",
      slug: "sono-profundo-consolida-memoria",
      excerpt: "Demo — configure o Supabase para persistir alterações.",
      content_md: "",
      cover_image_url: null,
      is_pinned: false,
      status: "published",
      published_at: null,
      created_at: "",
      updated_at: "",
      reading_minutes: 7,
      category_id: "c1",
      categories: null,
      profiles: null,
      article_tags: [],
    };
    return (
      <ArticleForm
        article={article}
        categories={demoCategories}
        tags={demoTags}
        translations={[
          {
            id: article.id,
            title: article.title,
            slug: article.slug,
            language_code: "pt-BR",
            status: article.status,
          },
        ]}
        mode="edit"
      />
    );
  }

  const supabase = await createClientServer();
  // getSession() é local (cookies) — o middleware já garantiu/renovou a sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) redirect(`/admin/login?next=/admin/artigo/${id}/editar`);

  const [{ data: article }, { data: cats }, { data: tags }] = await Promise.all(
    [
      supabase
        .from("articles")
        .select(
          "*, categories(id,name,slug), profiles(id,full_name,avatar_url), article_tags(tags(id,name,slug))",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
    ],
  );

  if (!article) redirect("/admin");

  const linkedTags = (
    (article.article_tags ?? []) as unknown as {
      tags: { id: string; name: string; slug: string };
    }[]
  )
    .map((x) => x.tags)
    .filter(Boolean);

  const { data: translations } = await supabase
    .from("articles")
    .select("id,title,slug,language_code,status")
    .eq("translation_group_id", article.translation_group_id)
    .order("language_code");

  return (
    <ArticleForm
      article={{
        ...article,
        categories: article.categories,
        profiles: article.profiles,
      }}
      categories={cats ?? []}
      tags={tags ?? []}
      initialTagIds={linkedTags.map((t) => t.id)}
      translations={(translations ?? []).map((version) => ({
        ...version,
        language_code: version.language_code as ArticleLanguage,
        status: version.status as "draft" | "published",
      }))}
      mode="edit"
    />
  );
}
