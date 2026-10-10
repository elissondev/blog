import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

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
    if (!title || !excerpt)
      return NextResponse.json(
        { error: "Título e resumo são obrigatórios." },
        { status: 400 },
      );

    const slug = slugify(String(body.slug ?? "")) || slugify(title);
    const record = {
      title,
      slug,
      excerpt,
      content_md: String(body.content_md ?? ""),
      cover_image_url: body.cover_image_url || null,
      is_pinned: body.is_pinned === true,
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

    revalidatePath("/", "layout");
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
      category_id: body.category_id || null,
      status: body.status === "published" ? "published" : "draft",
      reading_minutes: Number(body.reading_minutes) || 1,
    };

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

    revalidatePath("/", "layout");
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

  const { error, count } = await ctx.supabase
    .from("articles")
    .delete()
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (count === 0)
    return NextResponse.json(
      { error: "Nada excluído (sem permissão?)." },
      { status: 404 },
    );

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
