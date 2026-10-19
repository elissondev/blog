import { NextResponse, type NextRequest } from "next/server";
import { CACHE_TAGS, invalidatePublicCache } from "@/lib/cache";
import {
  createClientServer,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase não configurado (modo demo)." },
      { status: 503 },
    );
  }

  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fullName = String(body.full_name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const articleDescription = String(body.article_description ?? "").trim();
    const avatarUrl = body.avatar_url ? String(body.avatar_url).trim() : null;

    if (!fullName || fullName.length > 120) {
      return NextResponse.json(
        { error: "Informe um nome com até 120 caracteres." },
        { status: 400 },
      );
    }
    if (description.length > 2000) {
      return NextResponse.json(
        { error: "A descrição deve ter no máximo 2.000 caracteres." },
        { status: 400 },
      );
    }
    if (articleDescription.length > 2000) {
      return NextResponse.json(
        {
          error: "A descrição dos artigos deve ter no máximo 2.000 caracteres.",
        },
        { status: 400 },
      );
    }
    if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) {
      return NextResponse.json(
        { error: "A foto precisa ter um endereço HTTPS válido." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        description,
        article_description: articleDescription,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Perfil não encontrado para este usuário." },
        { status: 404 },
      );
    }

    invalidatePublicCache(
      CACHE_TAGS.articles,
      CACHE_TAGS.authors,
      CACHE_TAGS.sitemap,
      `author:${user.id}`,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Falha ao salvar perfil." },
      { status: 500 },
    );
  }
}
