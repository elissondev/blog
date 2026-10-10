import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não coloque lógica entre criar o cliente e a renovação de sessão.
  // Não chamamos getUser() aqui: essa ida ao servidor de auth a cada request é
  // lenta (e, se o host do projeto estiver incorreto na env, pode travar até
  // timeout — aparência de "carregando para sempre"). A validade real da sessão
  // é verificada uma única vez pela página /admin/login após o submit; o
  // layout/páginas do painel usam getSession() (cookies locais, sem rede).
  await supabase.auth.getSession();

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
