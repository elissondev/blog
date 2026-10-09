"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Tag } from "@/lib/types";

type CatRow = Category & { count?: number };
type TagRow = Tag & { count?: number };

export function CategoryManager({ categories }: { categories: CatRow[] }) {
  const [editing, setEditing] = useState<CatRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      {!creating && !editing && (
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Nova categoria
        </Button>
      )}

      {(creating || editing) && (
        <div className="rounded-lg border bg-card p-4">
          <CategoryFormFields category={editing} onDone={() => { setCreating(false); setEditing(null); }} />
        </div>
      )}

      <ul className="divide-y rounded-lg border bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">/{c.slug}{typeof c.count === "number" ? ` · ${c.count} artigo(s)` : ""}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label={`Editar ${c.name}`} onClick={() => { setEditing(c); setCreating(false); }}>
              <Pencil className="size-4" />
            </Button>
            <DeleteRow label={c.name} table="categories" id={c.id} />
          </li>
        ))}
        {categories.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma categoria ainda.</li>}
      </ul>
    </div>
  );
}

function CategoryFormFields({ category, onDone }: { category: CatRow | null; onDone: () => void }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(fd: FormData) {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "category", ...(Object.fromEntries(fd.entries())) }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Falha ao salvar");
      onDone();
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="cat-name">Nome *</label>
        <Input id="cat-name" name="name" defaultValue={category?.name ?? ""} required className="mt-1" placeholder="Neurociência" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="cat-slug">Slug</label>
        <Input id="cat-slug" name="slug" defaultValue={category?.slug ?? ""} className="mt-1" placeholder="auto-gerado" />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : null} Salvar
      </Button>
      {err && <p className="text-sm text-destructive sm:col-span-3">{err}</p>}
    </form>
  );
}

export function TagManager({ tags }: { tags: TagRow[] }) {
  const [editing, setEditing] = useState<TagRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      {!creating && !editing && (
        <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Nova tag
        </Button>
      )}

      {(creating || editing) && (
        <div className="rounded-lg border bg-card p-4">
          <TagFormFields tag={editing} onDone={() => { setCreating(false); setEditing(null); }} />
        </div>
      )}

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">#{t.name}</span>
            {typeof t.count === "number" && <span className="text-xs text-muted-foreground">{t.count}</span>}
            <Button variant="ghost" size="icon" className="size-7" aria-label={`Editar ${t.name}`} onClick={() => { setEditing(t); setCreating(false); }}>
              <Pencil className="size-3.5" />
            </Button>
            <DeleteRow label={t.name} table="tags" id={t.id} />
          </li>
        ))}
        {tags.length === 0 && <li className="text-sm text-muted-foreground">Nenhuma tag ainda.</li>}
      </ul>
    </div>
  );
}

function TagFormFields({ tag, onDone }: { tag: TagRow | null; onDone: () => void }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(fd: FormData) {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "tag", ...(Object.fromEntries(fd.entries())) }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Falha ao salvar");
      onDone();
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="tag-name">Nome *</label>
        <Input id="tag-name" name="name" defaultValue={tag?.name ?? ""} required className="mt-1" placeholder="neuroplasticidade" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground" htmlFor="tag-slug">Slug</label>
        <Input id="tag-slug" name="slug" defaultValue={tag?.slug ?? ""} className="mt-1" placeholder="auto-gerado" />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : null} Salvar
      </Button>
      {err && <p className="text-sm text-destructive sm:col-span-3">{err}</p>}
    </form>
  );
}

function DeleteRow({ label, table, id }: { label: string; table: "categories" | "tags"; id: string }) {
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!window.confirm(`Excluir "${label}"? Essa ação não pode ser desfeita.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/taxonomies?table=${table}&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Falha ao excluir");
      window.location.reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" aria-label={`Excluir ${label}`} onClick={del} disabled={busy}>
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </Button>
  );
}
