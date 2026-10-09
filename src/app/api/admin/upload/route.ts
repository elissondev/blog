import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** POST multipart/form-data com campo "file" → { url } público no bucket article-images. */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "Supabase não configurado (modo demo)." }, { status: 503 });

  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Campo 'file' ausente." }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Formato não suportado. Use JPG, PNG, WebP, AVIF ou GIF." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Imagem muito grande (máx. 5 MB)." }, { status: 400 });

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("article-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pub = supabase.storage.from("article-images").getPublicUrl(path);
  return NextResponse.json({ url: pub.data.publicUrl, path });
}
