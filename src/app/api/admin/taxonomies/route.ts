import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

async function requireUser() {
  if (!isSupabaseConfigured())
    return { error: NextResponse.json({ error: "Supabase não configurado (modo demo)." }, { status: 503 }) };
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  return { supabase, user };
}

/** POST JSON { kind: "category"|"tag", id?, name, slug?, description? } */
export async function POST(req: NextRequest) {
  const ctx = await requireUser();
  if ("error" in ctx) return ctx.error;

  try {
    const body = await req.json();
    const kind = String(body.kind ?? "");
    const table = kind === "category" ? "categories" : kind === "tag" ? "tags" : null;
    if (!table) return NextResponse.json({ error: "kind deve ser 'category' ou 'tag'." }, { status: 400 });

    const name = String(body.name ?? "").trim();
    const slug = slugify(String(body.slug ?? "")) || slugify(name);
    if (!name || !slug) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });

    const record: Record<string, unknown> = { name, slug };
    if (table === "categories") record.description = String(body.description ?? "").trim();

    let result;
    if (body.id) {
      result = await ctx.supabase.from(table).update(record).eq("id", String(body.id)).select("id").maybeSingle();
    } else {
      result = await ctx.supabase.from(table).insert(record).select("id").single();
    }
    if (result.error) throw result.error;

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (e) {
    const msg = (e as Error).message ?? "Falha ao salvar.";
    return NextResponse.json(
      { error: msg.includes("duplicate") || msg.includes("unique") ? "Já existe um item com esse slug." : msg },
      { status: 500 }
    );
  }
}

/** DELETE ?table=categories|tags&id=... */
export async function DELETE(req: NextRequest) {
  const ctx = await requireUser();
  if ("error" in ctx) return ctx.error;

  const tableParam = req.nextUrl.searchParams.get("table");
  const id = req.nextUrl.searchParams.get("id");
  if ((tableParam !== "categories" && tableParam !== "tags") || !id)
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });

  const { error } = await ctx.supabase.from(tableParam).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
