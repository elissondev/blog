"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import { TableRow } from "@tiptap/extension-table/row";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Link2,
  ImageIcon,
  Eye,
  PencilLine,
  Loader2,
  Check,
  Pin,
  X,
  TableProperties,
  Languages,
  Plus,
  Settings2,
  ChevronDown,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify, readingTime } from "@/lib/utils";
import {
  articlePath,
  isArticleLanguage,
  LOCALE_CONFIG,
  localizedTaxonomyName,
  type ArticleLanguage,
} from "@/lib/locales";
import type { ArticleFull, Category, Tag } from "@/lib/types";

type ArticleVersionLink = {
  id: string;
  title: string;
  slug: string;
  language_code: ArticleLanguage;
  status: "draft" | "published";
};

/* ---------- Conversão TipTap <-> Markdown (subconjunto GFM) ---------- */

type Node = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function inlineToMd(node: Node): string {
  let t = node.text ?? "";
  for (const m of node.marks ?? []) {
    if (m.type === "bold") t = `**${t}**`;
    else if (m.type === "italic") t = `*${t}*`;
    else if (m.type === "strike") t = `~~${t}~~`;
    else if (m.type === "code") t = "`" + t + "`";
    else if (m.type === "link")
      t = `[${t}](${(m.attrs?.href as string) ?? ""})`;
  }
  return t;
}

function cellToMd(cell: Node): string {
  return (cell.content ?? [])
    .map((c) => (c.type === "text" ? inlineToMd(c) : blockToMd(c)))
    .join("");
}

function blockToMd(node: Node, depth = 0): string {
  const inline = (node.content ?? [])
    .map((c) => (c.type === "text" ? inlineToMd(c) : blockToMd(c, depth)))
    .join("");
  switch (node.type) {
    case "doc":
      return (node.content ?? []).map((c) => blockToMd(c)).join("\n\n");
    case "paragraph":
      return inline;
    case "heading": {
      const lvl = (node.attrs?.level as number) ?? 1;
      return `${"#".repeat(lvl)} ${inline}`;
    }
    case "bulletList":
      return (node.content ?? [])
        .map(
          (li) =>
            `- ${(li.content ?? []).map((p) => p.content?.map(inlineToMd).join("") ?? "")}`,
        )
        .join("\n");
    case "orderedList":
      return (node.content ?? [])
        .map(
          (li, i) =>
            `${i + 1}. ${(li.content ?? []).map((p) => p.content?.map(inlineToMd).join("") ?? "")}`,
        )
        .join("\n");
    case "blockquote":
      return (node.content ?? [])
        .map((p) => `> ${p.content?.map(inlineToMd).join("") ?? ""}`)
        .join("\n> ");
    case "codeBlock":
      return (
        "```" +
        (node.attrs?.language ?? "") +
        "\n" +
        (node.content?.map((c) => c.text ?? "").join("") ?? "") +
        "\n```"
      );
    case "horizontalRule":
      return "---";
    case "image":
      return `![${(node.attrs?.alt as string) ?? ""}](${(node.attrs?.src as string) ?? ""})`;
    case "table": {
      const rows = (node.content ?? []).map((row) =>
        (row.content ?? []).map((cell) =>
          cellToMd(cell as Node)
            .replace(/\n/g, " ")
            .replace(/\|/g, "\\|")
            .trim(),
        ),
      );
      if (!rows.length) return "";
      const [header, ...bodyRows] = rows;
      const separator = header.map(() => "---");
      return [
        `| ${header.join(" | ")} |`,
        `| ${separator.join(" | ")} |`,
        ...bodyRows.map((row) => `| ${row.join(" | ")} |`),
      ].join("\n");
    }
    case "tableRow":
      return (node.content ?? [])
        .map((cell) => blockToMd(cell as Node))
        .join(" | ");
    case "tableHeader":
    case "tableCell":
      return (node.content ?? [])
        .map((c) => (c.type === "text" ? inlineToMd(c) : blockToMd(c, depth)))
        .join("");
    default:
      return inline;
  }
}

function docToMd(doc: object): string {
  return blockToMd(doc as Node);
}

function mdToHtml(md: string): string {
  // serialização simples para popular o editor ao editar um artigo salvo
  const lines = md.split("\n");
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inCode = false;
  let codeBuf: string[] = [];
  const inline = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/~~([^~]+)~~/g, "<s>$1</s>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const parseTableLine = (line: string): string[] =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const nextLine = lines[i + 1]?.trim() ?? "";

    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else inCode = true;
      continue;
    }
    if (inCode) {
      codeBuf.push(raw.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
      continue;
    }
    if (inList && !/^[-*] /.test(line) && !/^\d+\. /.test(line)) {
      out.push(`</${inList}>`);
      inList = null;
    }

    const isTableHeader =
      /^\|?.*\|.*\|?$/.test(line) &&
      /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(nextLine);
    if (isTableHeader) {
      const header = parseTableLine(line);
      const bodyRows: string[][] = [];
      i += 1;
      while (i + 1 < lines.length) {
        const candidate = lines[i + 1]?.trim() ?? "";
        if (!candidate || !/^\|.*\|$/.test(candidate)) break;
        bodyRows.push(parseTableLine(candidate));
        i += 1;
      }
      const thead = `<thead><tr>${header.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead>`;
      const tbody = bodyRows.length
        ? `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`
        : "";
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (/^# /.test(line)) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (/^## /.test(line)) out.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (/^### /.test(line)) out.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (/^> /.test(line))
      out.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`);
    else if (/^---$/.test(line)) out.push("<hr>");
    else if (/^[-*] /.test(line)) {
      if (inList !== "ul") {
        if (inList) out.push(`</${inList}>`);
        out.push("<ul>");
        inList = "ul";
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\d+\. /.test(line)) {
      if (inList !== "ol") {
        if (inList) out.push(`</${inList}>`);
        out.push("<ol>");
        inList = "ol";
      }
      out.push(`<li>${inline(line.replace(/^\d+\. /, ""))}</li>`);
    } else if (/^!\[/.test(line)) out.push(`<p>${inline(line)}</p>`);
    else if (line) out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push(`</${inList}>`);
  return out.join("\n");
}

/* ---------- Toolbar ---------- */

function TBtn({
  onClick,
  active,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex size-8 items-center justify-center rounded-md text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

export function ArticleForm({
  article,
  categories,
  tags,
  initialTagIds = [],
  initialCategoryId = null,
  initialCoverUrl = null,
  initialLanguage = "pt-BR",
  translationGroupId,
  translations = [],
  mode,
}: {
  article?: ArticleFull;
  categories: Category[];
  tags: Tag[];
  initialTagIds?: string[];
  initialCategoryId?: string | null;
  initialCoverUrl?: string | null;
  initialLanguage?: ArticleLanguage;
  translationGroupId?: string | null;
  translations?: ArticleVersionLink[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(
    article?.cover_image_url ?? initialCoverUrl ?? "",
  );
  const [isPinned, setIsPinned] = useState(article?.is_pinned ?? false);
  const [showHealthDisclaimer, setShowHealthDisclaimer] = useState(
    article?.show_health_disclaimer ?? true,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(
    article?.category_id ?? initialCategoryId ?? "__none__",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTagIds.length
      ? initialTagIds
      : (article?.article_tags ?? []).map((x: { tags: Tag }) => x.tags.id),
  );
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [tagOptions, setTagOptions] = useState(tags);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [savingTaxonomy, setSavingTaxonomy] = useState<
    "category" | "tag" | null
  >(null);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft",
  );
  const [languageCode, setLanguageCode] = useState<ArticleLanguage>(
    article?.language_code ?? initialLanguage,
  );
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<
    "cover" | "editor" | null
  >(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);
  const editorImagePosition = useRef<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension,
      Placeholder.configure({
        placeholder:
          "Escreva o artigo em formato rico — ele será convertido para Markdown…",
      }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
    ],
    content: article?.content_md ? mdToHtml(article.content_md) : "",
    editorProps: {
      attributes: {
        class:
          "tiptap prose dark:prose-invert max-w-none focus:outline-none px-1",
        "aria-label": "Conteúdo do artigo",
      },
    },
  });

  const uploadImage = useCallback(async () => {
    if (!editor) return;
    const url = window.prompt(
      "URL da imagem (ou faça upload pelo painel e cole aqui):",
    );
    if (!url) return;
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: title || "imagem do artigo" })
      .run();
  }, [editor, title]);

  async function uploadFile(file: File, target: "cover" | "editor") {
    setUploadingTarget(target);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no upload");
      if (target === "cover") {
        setCoverUrl(json.url);
      } else if (editor) {
        editor
          .chain()
          .focus()
          .setTextSelection(
            editorImagePosition.current ?? editor.state.selection.from,
          )
          .setImage({ src: json.url, alt: file.name })
          .run();
        editorImagePosition.current = null;
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingTarget(null);
    }
  }

  function chooseEditorImage() {
    if (!editor || uploadingTarget) return;
    editorImagePosition.current = editor.state.selection.from;
    editorImageInputRef.current?.click();
  }

  async function createTaxonomy(kind: "category" | "tag") {
    const name = (kind === "category" ? newCategoryName : newTagName).trim();
    if (!name) return;

    setSavingTaxonomy(kind);
    setTaxonomyError(null);
    try {
      const res = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Não foi possível criar.");

      if (kind === "category") {
        setCategoryOptions((previous) => [
          ...previous,
          {
            id: json.id,
            name,
            slug: slugify(name),
            description: null,
          },
        ]);
        setCategoryId(json.id);
        setNewCategoryName("");
        setShowCategoryForm(false);
      } else {
        setTagOptions((previous) => [
          ...previous,
          { id: json.id, name, slug: slugify(name) },
        ]);
        setSelectedTags((previous) => [...previous, json.id]);
        setNewTagName("");
        setShowTagForm(false);
      }
    } catch (e) {
      setTaxonomyError((e as Error).message);
    } finally {
      setSavingTaxonomy(null);
    }
  }

  async function save(target: "draft" | "published") {
    if (!editor) return;
    setSaving(target);
    setError(null);
    const content_md = docToMd(editor.getJSON());
    const payload = {
      id: article?.id,
      language_code: languageCode,
      translation_group_id:
        translationGroupId ?? article?.translation_group_id ?? null,
      title,
      slug: slug || slugify(title),
      excerpt,
      content_md,
      cover_image_url: coverUrl || null,
      is_pinned: isPinned,
      show_health_disclaimer: showHealthDisclaimer,
      category_id: categoryId === "__none__" ? null : categoryId,
      tag_ids: selectedTags,
      status: target,
      reading_minutes: readingTime(content_md),
    };
    const res = await fetch(
      mode === "edit" ? `/api/articles?id=${article?.id}` : "/api/articles",
      {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const json = await res.json().catch(() => ({}));
    setSaving(null);
    if (!res.ok) {
      setError(
        json.error ??
          "Não foi possível salvar. Verifique se o Supabase está configurado.",
      );
      if (mode === "create") {
        // demo: mostra preview do que seria salvo
      }
      return;
    }
    setStatus(target);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (mode === "create" && json.id) {
      if (target === "published" && !translationGroupId && json.slug)
        router.push(articlePath(languageCode, json.slug));
      else router.push(`/admin/artigo/${json.id}/editar`);
    } else router.refresh();
  }

  const mdPreview = editor ? docToMd(editor.getJSON()) : "";
  const savedVersions = article
    ? translations.some((version) => version.id === article.id)
      ? translations
      : [
          ...translations,
          {
            id: article.id,
            title: article.title,
            slug: article.slug,
            language_code: article.language_code ?? "pt-BR",
            status: article.status,
          },
        ]
    : translations;
  const existingLanguages = new Set(
    savedVersions.map((version) => version.language_code),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-bold">
          {mode === "edit" ? "Editar artigo" : "Novo artigo"}
        </h1>
        <div className="relative flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={settingsOpen}
            aria-controls="article-settings"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Settings2 className="size-4" />
            Configurações
            <ChevronDown
              className={`size-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
            />
          </Button>
          {article?.slug && article.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={articlePath(languageCode, article.slug)}
                target="_blank"
              >
                Ver público ↗
              </Link>
            </Button>
          )}
          {settingsOpen && (
            <div
              id="article-settings"
              className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] space-y-4 rounded-md border bg-card p-4 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <input
                  id="f-pinned"
                  type="checkbox"
                  checked={isPinned}
                  onChange={(event) => setIsPinned(event.target.checked)}
                  className="mt-1 size-4 accent-primary"
                />
                <div>
                  <label
                    htmlFor="f-pinned"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                  >
                    <Pin className="size-4" /> Fixar no topo
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prioriza este artigo nas listagens, exceto ao filtrar por
                    categoria ou tag.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t pt-4">
                <input
                  id="f-health-disclaimer"
                  type="checkbox"
                  checked={showHealthDisclaimer}
                  onChange={(event) =>
                    setShowHealthDisclaimer(event.currentTarget.checked)
                  }
                  className="mt-1 size-4 accent-primary"
                />
                <div>
                  <label
                    htmlFor="f-health-disclaimer"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Exibir aviso de saúde neste artigo
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    O aviso aparece antes da seção de referências, quando
                    houver.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {mode === "edit" && article && (
        <section
          aria-labelledby="article-versions-heading"
          className="space-y-3 rounded-md border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <Languages
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 id="article-versions-heading" className="text-sm font-semibold">
              Versões deste artigo
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedVersions.map((version) => (
              <div
                key={version.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <Badge variant="outline">
                  {LOCALE_CONFIG[version.language_code].label}
                </Badge>
                {version.id === article.id ? (
                  <span className="max-w-48 truncate font-medium">
                    {version.title}
                  </span>
                ) : (
                  <Link
                    href={`/admin/artigo/${version.id}/editar`}
                    className="max-w-48 truncate font-medium hover:underline"
                  >
                    {version.title}
                  </Link>
                )}
                <Badge
                  variant={
                    version.status === "published" ? "default" : "secondary"
                  }
                >
                  {version.status === "published" ? "Publicado" : "Rascunho"}
                </Badge>
                {version.status === "published" && (
                  <Link
                    href={articlePath(version.language_code, version.slug)}
                    target="_blank"
                    aria-label={`Ver versão ${LOCALE_CONFIG[version.language_code].label}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-muted-foreground">Adicionar versão:</span>
            {(Object.keys(LOCALE_CONFIG) as ArticleLanguage[])
              .filter((language) => !existingLanguages.has(language))
              .map((language) => (
                <Link
                  key={language}
                  href={`/admin/novo?translationOf=${article.translation_group_id ?? article.id}&language=${language}`}
                  className="font-medium text-primary hover:underline"
                >
                  {LOCALE_CONFIG[language].label}
                </Link>
              ))}
            {savedVersions.length === Object.keys(LOCALE_CONFIG).length && (
              <span className="text-muted-foreground">
                Todos os idiomas já têm uma versão.
              </span>
            )}
          </div>
        </section>
      )}

      <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        {mode === "create" && (
          <div>
            <Label htmlFor="f-language">Idioma da versão</Label>
            <Select
              value={languageCode}
              onValueChange={(value) => {
                if (isArticleLanguage(value)) setLanguageCode(value);
              }}
              disabled={Boolean(translationGroupId)}
            >
              <SelectTrigger id="f-language" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOCALE_CONFIG)
                  .filter(
                    ([language]) => translationGroupId || language === "pt-BR",
                  )
                  .map(([language, config]) => (
                    <SelectItem key={language} value={language}>
                      {config.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="f-title">Título *</Label>
          <Input
            id="f-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!article) setSlug(slugify(e.target.value));
            }}
            placeholder="Título do artigo"
            className="mt-1.5 h-11 text-lg font-medium"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="f-slug">Slug (URL)</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {articlePath(languageCode, "")}
              </span>
              <Input
                id="f-slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="pl-[4.6rem]"
                placeholder="titulo-do-artigo"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="f-cat">Categoria</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="f-cat" className="flex-1">
                  <SelectValue placeholder="Sem categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem categoria</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {localizedTaxonomyName(c, languageCode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {languageCode === "pt-BR" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setShowCategoryForm((visible) => !visible);
                    setTaxonomyError(null);
                  }}
                >
                  <Plus className="size-4" /> Nova
                </Button>
              )}
            </div>
            {languageCode === "pt-BR" && showCategoryForm && (
              <form
                className="mt-2 space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void createTaxonomy("category");
                }}
              >
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    aria-label="Nome da nova categoria"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Nome da categoria"
                    maxLength={80}
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !newCategoryName.trim() || savingTaxonomy !== null
                    }
                  >
                    {savingTaxonomy === "category" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Criar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryForm(false)}
                    disabled={savingTaxonomy !== null}
                  >
                    Cancelar
                  </Button>
                </div>
                {taxonomyError && (
                  <p className="text-sm text-destructive">{taxonomyError}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="f-excerpt">Resumo (excerpt) *</Label>
          <Textarea
            id="f-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Chamada curta exibida nos cards, SEO e RSS (até 280 caracteres)"
            className="mt-1.5"
            required
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {excerpt.length}/280
          </p>
        </div>

        <div>
          <Label htmlFor="f-cover">Imagem de capa (URL)</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="f-cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://… ou faça upload ao lado"
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 text-sm hover:bg-accent">
              {uploadingTarget === "cover" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImageIcon className="size-4" />
              )}{" "}
              Upload
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f, "cover");
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="Prévia da capa"
              className="mt-3 aspect-video w-full max-w-sm rounded-lg border object-cover"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <Label>Tags</Label>
            {languageCode === "pt-BR" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTagForm((visible) => !visible);
                  setTaxonomyError(null);
                }}
              >
                <Plus className="size-4" /> Nova
              </Button>
            )}
          </div>
          {languageCode === "pt-BR" && showTagForm && (
            <form
              className="mt-2 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                void createTaxonomy("tag");
              }}
            >
              <div className="flex gap-2">
                <Input
                  autoFocus
                  aria-label="Nome da nova tag"
                  value={newTagName}
                  onChange={(event) => setNewTagName(event.target.value)}
                  placeholder="Nome da tag"
                  maxLength={80}
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newTagName.trim() || savingTaxonomy !== null}
                >
                  {savingTaxonomy === "tag" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Criar"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagForm(false)}
                  disabled={savingTaxonomy !== null}
                >
                  Cancelar
                </Button>
              </div>
              {taxonomyError && (
                <p className="text-sm text-destructive">{taxonomyError}</p>
              )}
            </form>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {tagOptions.map((t) => {
              const on = selectedTags.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      on ? prev.filter((x) => x !== t.id) : [...prev, t.id],
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  {on && <Check className="mr-1 inline size-3" />}#
                  {localizedTaxonomyName(t, languageCode)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="sticky top-14 z-30 flex flex-wrap items-center gap-1 border-b bg-card/95 p-2 shadow-sm backdrop-blur">
          <TBtn
            label="Negrito"
            active={!!editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </TBtn>
          <TBtn
            label="Itálico"
            active={!!editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </TBtn>
          <TBtn
            label="Tachado"
            active={!!editor?.isActive("strike")}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </TBtn>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <TBtn
            label="Cabeçalho 1"
            active={!!editor?.isActive("heading", { level: 1 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="size-4" />
          </TBtn>
          <TBtn
            label="Cabeçalho 2"
            active={!!editor?.isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </TBtn>
          <TBtn
            label="Cabeçalho 3"
            active={!!editor?.isActive("heading", { level: 3 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="size-4" />
          </TBtn>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <TBtn
            label="Lista não ordenada"
            active={!!editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </TBtn>
          <TBtn
            label="Lista ordenada"
            active={!!editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </TBtn>
          <TBtn
            label="Citação"
            active={!!editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </TBtn>
          <TBtn
            label="Bloco de código"
            active={!!editor?.isActive("codeBlock")}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="size-4" />
          </TBtn>
          <TBtn
            label="Linha horizontal"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="size-4" />
          </TBtn>
          <TBtn
            label="Inserir tabela"
            active={!!editor?.isActive("table")}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableProperties className="size-4" />
          </TBtn>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <TBtn
            label="Inserir link"
            active={!!editor?.isActive("link")}
            onClick={() => {
              const url = window.prompt("URL do link:");
              if (url)
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              else
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange("link")
                  .unsetLink()
                  .run();
            }}
          >
            <Link2 className="size-4" />
          </TBtn>
          <TBtn label="Inserir imagem" onClick={uploadImage}>
            <ImageIcon className="size-4" />
          </TBtn>
          <TBtn
            label="Enviar imagem para o artigo"
            onClick={chooseEditorImage}
            disabled={uploadingTarget !== null}
          >
            {uploadingTarget === "editor" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
          </TBtn>
          <input
            ref={editorImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Selecionar imagem para o artigo"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void uploadFile(file, "editor");
              event.currentTarget.value = "";
            }}
          />
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <TBtn
            label="Desfazer"
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo className="size-4" />
          </TBtn>
          <TBtn
            label="Refazer"
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo className="size-4" />
          </TBtn>
          <span className="ml-auto" />
          <Button
            variant={preview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPreview((p) => !p)}
          >
            {preview ? (
              <PencilLine className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}{" "}
            {preview ? "Editar" : "Preview"}
          </Button>
        </div>

        {preview ? (
          <div className="prose prose-slate dark:prose-invert max-w-none p-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
            >
              {mdPreview || "_Nada para visualizar ainda._"}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="p-4" onClick={() => editor?.chain().focus().run()}>
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Barra fixa de ações */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Badge variant={status === "published" ? "default" : "secondary"}>
            {status === "published" ? "Publicado" : "Rascunho"}
          </Badge>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="size-4" /> Salvo!
            </span>
          )}
          <div className="ml-auto flex gap-2">
            {mode === "edit" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin")}
                disabled={saving !== null}
                aria-label="Cancelar edição"
                title="Cancelar edição"
              >
                <X className="size-4" />
                <span className="hidden sm:inline">Cancelar</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => save("draft")}
              disabled={saving !== null}
            >
              {saving === "draft" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}{" "}
              Salvar rascunho
            </Button>
            <Button
              onClick={() => save("published")}
              disabled={saving !== null || !title || !excerpt}
            >
              {saving === "published" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}{" "}
              Salvar e publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
