"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
          <CategoryFormFields
            category={editing}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <ul className="divide-y rounded-lg border bg-card">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                /{c.slug}
                {typeof c.count === "number" ? ` · ${c.count} artigo(s)` : ""}
              </p>
              {(c.name_en || c.name_es) && (
                <p className="truncate text-xs text-muted-foreground">
                  {c.name_en ? `EN: ${c.name_en}` : ""}
                  {c.name_en && c.name_es ? " · " : ""}
                  {c.name_es ? `ES: ${c.name_es}` : ""}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar ${c.name}`}
              onClick={() => {
                setEditing(c);
                setCreating(false);
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <DeleteRow label={c.name} table="categories" id={c.id} />
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria ainda.
          </li>
        )}
      </ul>
    </div>
  );
}

function CategoryFormFields({
  category,
  onDone,
}: {
  category: CatRow | null;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(fd: FormData) {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "category",
          ...Object.fromEntries(fd.entries()),
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Falha ao salvar");
      onDone();
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-2">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div>
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="cat-name"
        >
          Nome *
        </label>
        <Input
          id="cat-name"
          name="name"
          defaultValue={category?.name ?? ""}
          required
          className="mt-1"
          placeholder="Nutrição"
        />
      </div>
      <div>
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="cat-slug"
        >
          Slug
        </label>
        <Input
          id="cat-slug"
          name="slug"
          defaultValue={category?.slug ?? ""}
          className="mt-1"
          placeholder="auto-gerado"
        />
      </div>
      <div className="sm:col-span-2">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="cat-description"
        >
          Descrição
        </label>
        <Textarea
          id="cat-description"
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          className="mt-1"
          placeholder="Descreva os assuntos desta categoria"
        />
      </div>
      <div className="grid gap-3 rounded-md border p-3 sm:col-span-2 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">English</h3>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="cat-name-en"
          >
            Name
          </label>
          <Input
            id="cat-name-en"
            name="name_en"
            defaultValue={category?.name_en ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="cat-slug-en"
          >
            Slug
          </label>
          <Input
            id="cat-slug-en"
            name="slug_en"
            defaultValue={category?.slug_en ?? ""}
            className="mt-1"
            placeholder="auto-generated"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="cat-description-en"
          >
            Description
          </label>
          <Textarea
            id="cat-description-en"
            name="description_en"
            defaultValue={category?.description_en ?? ""}
            rows={2}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid gap-3 rounded-md border p-3 sm:col-span-2 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">Español</h3>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="cat-name-es"
          >
            Nombre
          </label>
          <Input
            id="cat-name-es"
            name="name_es"
            defaultValue={category?.name_es ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="cat-slug-es"
          >
            Slug
          </label>
          <Input
            id="cat-slug-es"
            name="slug_es"
            defaultValue={category?.slug_es ?? ""}
            className="mt-1"
            placeholder="generado automáticamente"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="cat-description-es"
          >
            Descripción
          </label>
          <Textarea
            id="cat-description-es"
            name="description_es"
            defaultValue={category?.description_es ?? ""}
            rows={2}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={saving}
        >
          <X className="size-4" /> Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null} Salvar
        </Button>
      </div>
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
          <TagFormFields
            tag={editing}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              <span className="block truncate">#{t.name}</span>
              {(t.name_en || t.name_es) && (
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {t.name_en ? `EN: ${t.name_en}` : ""}
                  {t.name_en && t.name_es ? " · " : ""}
                  {t.name_es ? `ES: ${t.name_es}` : ""}
                </span>
              )}
            </span>
            {typeof t.count === "number" && (
              <span className="text-xs text-muted-foreground">{t.count}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Editar ${t.name}`}
              onClick={() => {
                setEditing(t);
                setCreating(false);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
            <DeleteRow label={t.name} table="tags" id={t.id} />
          </li>
        ))}
        {tags.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhuma tag ainda.</li>
        )}
      </ul>
    </div>
  );
}

function TagFormFields({
  tag,
  onDone,
}: {
  tag: TagRow | null;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(fd: FormData) {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "tag",
          ...Object.fromEntries(fd.entries()),
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Falha ao salvar");
      onDone();
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={submit} className="grid gap-3 sm:grid-cols-2">
      {tag && <input type="hidden" name="id" value={tag.id} />}
      <div>
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="tag-name"
        >
          Nome *
        </label>
        <Input
          id="tag-name"
          name="name"
          defaultValue={tag?.name ?? ""}
          required
          className="mt-1"
          placeholder="alimentação"
        />
      </div>
      <div>
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="tag-slug"
        >
          Slug
        </label>
        <Input
          id="tag-slug"
          name="slug"
          defaultValue={tag?.slug ?? ""}
          className="mt-1"
          placeholder="auto-gerado"
        />
      </div>
      <div className="grid gap-3 rounded-md border p-3 sm:col-span-2 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">English</h3>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-name-en"
          >
            Name
          </label>
          <Input
            id="tag-name-en"
            name="name_en"
            defaultValue={tag?.name_en ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-slug-en"
          >
            Slug
          </label>
          <Input
            id="tag-slug-en"
            name="slug_en"
            defaultValue={tag?.slug_en ?? ""}
            className="mt-1"
            placeholder="auto-generated"
          />
        </div>
      </div>
      <div className="grid gap-3 rounded-md border p-3 sm:col-span-2 sm:grid-cols-2">
        <h3 className="text-sm font-semibold sm:col-span-2">Español</h3>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-name-es"
          >
            Nombre
          </label>
          <Input
            id="tag-name-es"
            name="name_es"
            defaultValue={tag?.name_es ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="tag-slug-es"
          >
            Slug
          </label>
          <Input
            id="tag-slug-es"
            name="slug_es"
            defaultValue={tag?.slug_es ?? ""}
            className="mt-1"
            placeholder="generado automáticamente"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="sm:col-span-2 sm:justify-self-end"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : null} Salvar
      </Button>
      {err && <p className="text-sm text-destructive sm:col-span-3">{err}</p>}
    </form>
  );
}

function DeleteRow({
  label,
  table,
  id,
}: {
  label: string;
  table: "categories" | "tags";
  id: string;
}) {
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!window.confirm(`Excluir "${label}"? Essa ação não pode ser desfeita.`))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/taxonomies?table=${table}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error((await res.json()).error ?? "Falha ao excluir");
      window.location.reload();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-destructive hover:text-destructive"
      aria-label={`Excluir ${label}`}
      onClick={del}
      disabled={busy}
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </Button>
  );
}
