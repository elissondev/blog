import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { QuoteManager } from "@/components/admin/quote-manager";
import type { InspirationalQuote } from "@/lib/types";

export default async function AdminQuotesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="max-w-2xl space-y-2">
        <h1 className="font-serif text-2xl font-bold">Citações</h1>
        <p className="text-sm text-muted-foreground">
          Configure o Supabase para cadastrar citações. A tabela é criada pela
          migração <code>20261014_quotes.sql</code>.
        </p>
      </section>
    );
  }

  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("quotes")
    .select("id, text, author, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="max-w-3xl space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Citações inspiradoras</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre frases e seus autores. Uma citação será escolhida
          aleatoriamente para aparecer na página inicial.
        </p>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 p-4 text-sm text-destructive"
        >
          Não foi possível carregar as citações. Confirme se a migração do
          Supabase foi aplicada. ({error.message})
        </p>
      ) : (
        <QuoteManager quotes={(data ?? []) as InspirationalQuote[]} />
      )}
    </section>
  );
}
