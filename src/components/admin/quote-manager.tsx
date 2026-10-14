"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InspirationalQuote } from "@/lib/types";

export function QuoteManager({ quotes }: { quotes: InspirationalQuote[] }) {
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: values.get("text"),
          author: values.get("author"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Falha ao salvar citação.");
      }
      window.location.reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuote(quote: InspirationalQuote) {
    if (
      !window.confirm(
        `Excluir a citação de ${quote.author}? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setDeletingId(quote.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/quotes?id=${encodeURIComponent(quote.id)}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Falha ao excluir citação.");
      }
      window.location.reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={createQuote}
        className="space-y-4 rounded-lg border bg-card p-4"
      >
        <div className="space-y-2">
          <label htmlFor="quote-text" className="text-sm font-medium">
            Frase
          </label>
          <Textarea
            id="quote-text"
            name="text"
            rows={3}
            maxLength={1000}
            required
            placeholder="Digite a citação inspiradora"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="quote-author" className="text-sm font-medium">
              Autor
            </label>
            <Input
              id="quote-author"
              name="author"
              maxLength={120}
              required
              placeholder="Nome do autor"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Adicionar citação
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      <ul className="divide-y rounded-lg border bg-card">
        {quotes.map((quote) => (
          <li key={quote.id} className="flex items-start gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <blockquote className="whitespace-pre-line font-serif leading-relaxed">
                “{quote.text}”
              </blockquote>
              <p className="mt-2 text-sm text-muted-foreground">
                — {quote.author}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive hover:text-destructive"
              aria-label={`Excluir citação de ${quote.author}`}
              onClick={() => deleteQuote(quote)}
              disabled={deletingId !== null}
            >
              {deletingId === quote.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </li>
        ))}
        {quotes.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma citação cadastrada.
          </li>
        )}
      </ul>
    </div>
  );
}
