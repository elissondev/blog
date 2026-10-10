import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, FileText, FolderTree, LogOut, PlusCircle, ExternalLink } from "lucide-react";
import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";
import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel — NeuroBlog", template: "%s · Painel | NeuroBlog" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Sem Supabase configurado → modo demo (login indisponível, mas visual acessível)
  let userName = "Modo demonstração";
  if (isSupabaseConfigured()) {
    const supabase = await createClientServer();
    // getUser() faz UMA validação de rede por navegação (não a cada request,
    // como fazia o middleware). Cookies adulteradas/expiradas são rejeitadas
    // aqui — e só então redirecionamos ao login, quebrando qualquer loop.
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/admin/login");
    const meta = data.user.user_metadata?.full_name as string | undefined;
    userName = meta ?? data.user.email ?? "Administrador";
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-serif text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </span>
            NeuroBlog <span className="text-xs font-normal text-muted-foreground">· painel</span>
          </Link>
          <nav aria-label="Navegação do painel" className="flex items-center gap-1 text-sm">
            <Link href="/admin" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-accent">
              <FileText className="size-4" /> Artigos
            </Link>
            <Link href="/admin/novo" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-accent">
              <PlusCircle className="size-4" /> Novo artigo
            </Link>
            <Link href="/admin/categorias" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-accent">
              <FolderTree className="size-4" /> Categorias &amp; Tags
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:inline">{userName}</span>
            <Button variant="ghost" size="sm" asChild title="Ver site">
              <Link href="/" target="_blank"><ExternalLink className="size-4" /></Link>
            </Button>
            {isSupabaseConfigured() && (
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit" title="Sair">
                  <LogOut className="size-4" /> <span className="sr-only">Sair</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
