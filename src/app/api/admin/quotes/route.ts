import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { CACHE_TAGS, invalidatePublicCache } from "@/lib/cache";
import {
  createClientServer,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

async function requireUser() {
  if (!isSupabaseConfigured()) {
    return {
      error: NextResponse.json(
        { error: "Supabase não configurado (modo demo)." },
        { status: 503 },
      ),
    };
  }

  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  const context = await requireUser();
  if ("error" in context) return context.error;

  try {
    const body = await request.json();
    const text = String(body.text ?? "").trim();
    const author = String(body.author ?? "").trim();
    if (!text || text.length > 1000) {
      return NextResponse.json(
        { error: "A frase deve ter entre 1 e 1.000 caracteres." },
        { status: 400 },
      );
    }
    if (!author || author.length > 120) {
      return NextResponse.json(
        { error: "O autor deve ter entre 1 e 120 caracteres." },
        { status: 400 },
      );
    }

    const { error } = await context.supabase.from("quotes").insert({
      text,
      author,
      created_by: context.user.id,
    });
    if (error) throw error;

    invalidatePublicCache(CACHE_TAGS.quotes);
    revalidatePath("/admin/citacoes");
    return NextResponse.json({ ok: true });
  } catch (cause) {
    return NextResponse.json(
      { error: (cause as Error).message || "Falha ao salvar citação." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const context = await requireUser();
  if ("error" in context) return context.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID da citação ausente." },
      { status: 400 },
    );
  }

  const { data, error } = await context.supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "Citação não encontrada ou sem permissão para excluir." },
      { status: 404 },
    );
  }

  invalidatePublicCache(CACHE_TAGS.quotes);
  revalidatePath("/admin/citacoes");
  return NextResponse.json({ ok: true });
}
