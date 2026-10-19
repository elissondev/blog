import { NextResponse, type NextRequest } from "next/server";
import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { CACHE_TAGS, invalidatePublicCache } from "@/lib/cache";
import { isArticleLanguage } from "@/lib/locales";

function revalidateArticles(...slugs: string[]) {
  invalidatePublicCache(
    CACHE_TAGS.articles,
    CACHE_TAGS.authors,
    CACHE_TAGS.categories,
    CACHE_TAGS.tags,
    CACHE_TAGS.sitemap,
    ...slugs.map((slug) => `article:${slug}`),
  );
}

async function requireUser() {
  if (!isSupabaseConfigured())
    return {
      error: NextResponse.json(
        { error: "Supabase não configurado (modo demo)." },
        { status: 503 },
      ),
    };
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  return { supabase, user };
}

/** POST — criar artigo. PATCH (?id=) — atualizar. DELETE (?id=) — excluir. */
export async function POST(req: NextRequest) {
  const ctx = await requireUser();
  if ("error" in ctx) return ctx.error;

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const excerpt = String(body.excerpt ?? "").trim();
    const languageCode = String(body.language_code ?? "pt-BR");
    const translationGroupId = String(body.translation_group_id ?? "").trim();
    if (!title || !excerpt)
      return NextResponse.json(
        { error: "Título e resumo são obrigatórios." },
        { status: 400 },
      );
    if (!isArticleLanguage(languageCode))
      return NextResponse.json({ error: "Idioma inválido." }, { status: 400 });

    if (translationGroupId) {
      const { data: source, error: sourceError } = await ctx.supabase
        .from("articles")
        .select("id")
        .eq("translation_group_id", translationGroupId)
        .eq("author_id", ctx.user.id)
        .limit(1)
        .maybeSingle();
      if (sourceError) throw sourceError;
      if (!source)
        return NextResponse.json(
          { error: "Artigo de origem não encontrado ou sem permissão." },
          { status: 404 },
        );

      const { data: existing, error: existingError } = await ctx.supabase
        .from("articles")
        .select("id")
        .eq("translation_group_id", translationGroupId)
        .eq("language_code", languageCode)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing)
        return NextResponse.json(
          { error: "Já existe uma versão nesse idioma para este artigo." },
          { status: 409 },
        );
    }

    const slug = slugify(String(body.slug ?? "")) || slugify(title);
    const record = {
      title,
      slug,
      language_code: languageCode,
      ...(translationGroupId
        ? { translation_group_id: translationGroupId }
        : {}),
      excerpt,
      content_md: String(body.content_md ?? ""),
      cover_image_url: body.cover_image_url || null,
      is_pinned: body.is_pinned === true,
      show_health_disclaimer: body.show_health_disclaimer === true,
      category_id: body.category_id || null,
      status: body.status === "published" ? "published" : "draft",
      reading_minutes: Number(body.reading_minutes) || 1,
      author_id: ctx.user.id,
    };

    const { data, error } = await ctx.supabase
      .from("articles")
      .insert(record)
      .select("id,slug")
      .single();
    if (error) throw error;

    if (Array.isArray(body.tag_ids) && body.tag_ids.length) {
      const links = body.tag_ids.map((tag_id: string) => ({
        article_id: data.id,
        tag_id,
      }));
      const { error: te } = await ctx.supabase
        .from("article_tags")
        .insert(links);
      if (te) console.error("article_tags insert:", te.message);
    }

    revalidateArticles(data.slug);
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Falha ao salvar." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireUser();
  if ("error" in ctx) return ctx.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { error: "Parâmetro id ausente." },
      { status: 400 },
    );

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title)
      return NextResponse.json(
        { error: "Título é obrigatório." },
        { status: 400 },
      );

    const slug = slugify(String(body.slug ?? "")) || slugify(title);
    const patch: Record<string, unknown> = {
      title,
      slug,
      excerpt: String(body.excerpt ?? "").trim(),
      content_md: String(body.content_md ?? ""),
      cover_image_url: body.cover_image_url || null,
      is_pinned: body.is_pinned === true,
      show_health_disclaimer: body.show_health_disclaimer === true,
      category_id: body.category_id || null,
      status: body.status === "published" ? "published" : "draft",
      reading_minutes: Number(body.reading_minutes) || 1,
    };

    const { data: previous, error: previousError } = await ctx.supabase
      .from("articles")
      .select("slug,translation_group_id")
      .eq("id", id)
      .maybeSingle();
    if (previousError) throw previousError;
    if (!previous)
      return NextResponse.json(
        { error: "Artigo não encontrado ou sem permissão." },
        { status: 404 },
      );

    const { data, error } = await ctx.supabase
      .from("articles")
      .update(patch)
      .eq("id", id)
      .select("id,slug,status")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json(
        { error: "Artigo não encontrado ou sem permissão." },
        { status: 404 },
      );

    // substitui tags
    await ctx.supabase.from("article_tags").delete().eq("article_id", id);
    if (Array.isArray(body.tag_ids) && body.tag_ids.length) {
      const links = body.tag_ids.map((tag_id: string) => ({
        article_id: id,
        tag_id,
      }));
      await ctx.supabase.from("article_tags").insert(links);
    }

    revalidateArticles(previous.slug, data.slug);
    invalidatePublicCache(`translation-group:${previous.translation_group_id}`);
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Falha ao atualizar." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireUser();
  if ("error" in ctx) return ctx.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { error: "Parâmetro id ausente." },
      { status: 400 },
    );

  const { data, error } = await ctx.supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .select("slug,translation_group_id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json(
      { error: "Nada excluído (sem permissão?)." },
      { status: 404 },
    );

  revalidateArticles(data.slug);
  invalidatePublicCache(`translation-group:${data.translation_group_id}`);
  return NextResponse.json({ ok: true });
}
