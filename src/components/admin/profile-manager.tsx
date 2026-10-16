"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, Save, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProfileManager({
  fullName: initialName,
  description: initialDescription,
  articleDescription: initialArticleDescription,
  avatarUrl: initialAvatarUrl,
}: {
  fullName: string;
  description: string;
  articleDescription: string;
  avatarUrl: string | null;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [articleDescription, setArticleDescription] = useState(
    initialArticleDescription,
  );
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Falha ao enviar foto.");
      setAvatarUrl(result.url as string);
      setMessage("Foto enviada. Salve o perfil para publicar a alteração.");
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          description,
          article_description: articleDescription,
          avatar_url: avatarUrl,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Falha ao salvar perfil.");
      setMessage("Perfil salvo.");
      window.location.reload();
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={saveProfile}
      className="space-y-5 rounded-lg border bg-card p-5"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`Foto de ${fullName || "perfil"}`}
              width={96}
              height={96}
              className="size-full object-cover"
            />
          ) : (
            <UserRound
              className="size-9 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="profile-photo"
            className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent focus-within:outline-2 focus-within:outline-offset-2"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            Escolher foto
          </label>
          <Input
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={uploadPhoto}
            disabled={uploading}
            className="sr-only"
          />
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAvatarUrl(null)}
            >
              <Trash2 className="size-4" /> Remover foto
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, AVIF ou GIF. Máximo de 5 MB.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-name" className="text-sm font-medium">
          Nome público
        </label>
        <Input
          id="profile-name"
          value={fullName}
          onChange={(event) => setFullName(event.currentTarget.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-description" className="text-sm font-medium">
          Descrição da página do autor
        </label>
        <Textarea
          id="profile-description"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          rows={5}
          maxLength={2000}
          placeholder="Escreva uma breve apresentação para sua página de autor."
        />
        <p className="text-right text-xs text-muted-foreground">
          {description.length}/2000
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="profile-article-description"
          className="text-sm font-medium"
        >
          Descrição exibida abaixo dos artigos
        </label>
        <Textarea
          id="profile-article-description"
          value={articleDescription}
          onChange={(event) => setArticleDescription(event.currentTarget.value)}
          rows={5}
          maxLength={2000}
          placeholder="Escreva uma apresentação para o rodapé dos artigos."
        />
        <p className="text-right text-xs text-muted-foreground">
          {articleDescription.length}/2000
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div aria-live="polite" className="text-sm">
          {error && <p className="text-destructive">{error}</p>}
          {message && <p className="text-muted-foreground">{message}</p>}
        </div>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}
