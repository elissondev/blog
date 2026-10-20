import { NextResponse, type NextRequest } from "next/server";
import {
  createClientPublic,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string | null): value is string {
  return value !== null && uuidPattern.test(value);
}

async function readLikeState(
  articleId: string,
  voterId: string,
  action: "article_like_state" | "like_article",
) {
  const supabase = createClientPublic();
  return supabase.rpc(action, {
    p_article_id: articleId,
    p_voter_id: voterId,
  });
}

function toResponse(data: unknown, error: { message: string } | null) {
  if (error) {
    console.error("article likes:", error.message);
    return NextResponse.json(
      { error: "Falha ao consultar curtidas." },
      { status: 500 },
    );
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    return NextResponse.json(
      { error: "Artigo não encontrado." },
      { status: 404 },
    );
  }

  const row = result as { like_count: number; liked: boolean };
  return NextResponse.json(
    { count: Number(row.like_count), liked: row.liked },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("articleId");
  const voterId = request.nextUrl.searchParams.get("voterId");
  if (!isUuid(articleId) || !isUuid(voterId)) {
    return NextResponse.json(
      { error: "Identificadores inválidos." },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Curtidas indisponíveis." },
      { status: 503 },
    );
  }

  const { data, error } = await readLikeState(
    articleId,
    voterId,
    "article_like_state",
  );
  return toResponse(data, error);
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Curtidas indisponíveis." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      articleId?: unknown;
      voterId?: unknown;
    };
    const articleId =
      typeof body.articleId === "string" ? body.articleId : null;
    const voterId = typeof body.voterId === "string" ? body.voterId : null;
    if (!isUuid(articleId) || !isUuid(voterId)) {
      return NextResponse.json(
        { error: "Identificadores inválidos." },
        { status: 400 },
      );
    }

    const { data, error } = await readLikeState(
      articleId,
      voterId,
      "like_article",
    );
    return toResponse(data, error);
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }
}
