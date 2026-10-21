import Link from "next/link";
import { Leaf, Lock } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Entrar — Painel | Élisson Kario",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="admin-login-page flex w-full flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-2xl font-bold"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            Élisson Kario
          </Link>
          <p className="text-sm text-muted-foreground">Painel administrativo</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="size-4" />
            </span>
            <div>
              <h1 className="text-lg font-semibold">Bem-vindo de volta</h1>
              <p className="text-sm text-muted-foreground">
                Entre com sua conta para gerenciar artigos.
              </p>
            </div>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="space-y-4">
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                O Supabase ainda não está configurado (<code>.env.local</code>).
                Preencha <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e{" "}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> para habilitar o login
                real. O site continua funcionando em modo demonstração.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin">Ir para o painel (modo demo)</Link>
              </Button>
            </div>
          ) : (
            <LoginForm next={next} />
          )}
        </div>
      </div>
    </div>
  );
}
