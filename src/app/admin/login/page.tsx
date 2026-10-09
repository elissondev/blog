import Link from "next/link";
import { Brain, Lock } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

export const metadata = {
  title: "Entrar — Painel | NeuroBlog",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Brain className="size-5" />
            </span>
            NeuroBlog
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
              <p className="text-sm text-muted-foreground">Entre com sua conta para gerenciar artigos.</p>
            </div>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="space-y-4">
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                O Supabase ainda não está configurado (<code>.env.local</code>). Preencha{" "}
                <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e{" "}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> para habilitar o login real. O site continua
                funcionando em modo demonstração.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin">Ir para o painel (modo demo)</Link>
              </Button>
            </div>
          ) : (
            <LoginForm searchParams={searchParams} />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            ← Voltar ao blog
          </Link>
        </p>
      </div>
    </div>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <form action={loginAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required placeholder="voce@exemplo.com" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className="h-11" />
      </div>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error === "invalid" ? "E-mail ou senha incorretos." : "Ocorreu um erro ao entrar. Tente novamente."}
        </p>
      )}
      <Button type="submit" className="w-full h-11">Entrar</Button>
    </form>
  );
}
