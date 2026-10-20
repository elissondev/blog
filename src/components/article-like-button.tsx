"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Copy,
  Facebook,
  Heart,
  MessageCircle,
  Share2,
  Twitter,
} from "lucide-react";

const labels = {
  "pt-BR": {
    like: "Curtir",
    liked: "Curtido",
    likes: "curtidas",
    loading: "Carregando curtidas",
    unavailable: "Curtidas indisponíveis",
    share: "Compartilhar",
    copy: "Copiar link",
    copied: "Link copiado",
    failed: "Não foi possível compartilhar",
    openMenu: "Abrir menu de compartilhamento",
    facebook: "Facebook",
    x: "X",
    whatsapp: "WhatsApp",
  },
  en: {
    like: "Like",
    liked: "Liked",
    likes: "likes",
    loading: "Loading likes",
    unavailable: "Likes unavailable",
    share: "Share",
    copy: "Copy link",
    copied: "Link copied",
    failed: "Could not share",
    openMenu: "Open share menu",
    facebook: "Facebook",
    x: "X",
    whatsapp: "WhatsApp",
  },
  es: {
    like: "Me gusta",
    liked: "Te gusta",
    likes: "me gusta",
    loading: "Cargando reacciones",
    unavailable: "Reacciones no disponibles",
    share: "Compartir",
    copy: "Copiar enlace",
    copied: "Enlace copiado",
    failed: "No se pudo compartir",
    openMenu: "Abrir menú de compartir",
    facebook: "Facebook",
    x: "X",
    whatsapp: "WhatsApp",
  },
} as const;

export function ArticleLikeButton({
  articleId,
  locale,
}: {
  articleId: string;
  locale: keyof typeof labels;
}) {
  const text = labels[locale];
  const [voterId, setVoterId] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [unavailable, setUnavailable] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    let storedVoterId: string;

    try {
      storedVoterId = localStorage.getItem("neuroblog-voter-id") ?? "";
      if (!/^[0-9a-f-]{36}$/i.test(storedVoterId)) {
        storedVoterId = crypto.randomUUID();
        localStorage.setItem("neuroblog-voter-id", storedVoterId);
      }
    } catch {
      storedVoterId = crypto.randomUUID();
    }

    setVoterId(storedVoterId);
    const query = new URLSearchParams({ articleId, voterId: storedVoterId });

    fetch(`/api/articles/likes?${query}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Likes unavailable");
        return (await response.json()) as { count: number; liked: boolean };
      })
      .then((result) => {
        if (!active) return;
        setCount(result.count);
        setLiked(result.liked);
      })
      .catch(() => {
        if (active) setUnavailable(true);
      });

    return () => {
      active = false;
    };
  }, [articleId]);

  async function handleLike() {
    if (!voterId || liked || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/articles/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, voterId }),
      });
      if (!response.ok) throw new Error("Likes unavailable");
      const result = (await response.json()) as {
        count: number;
        liked: boolean;
      };
      setCount(result.count);
      setLiked(result.liked);
    } catch {
      setUnavailable(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  function handleSocialShare(platform: "facebook" | "x" | "whatsapp") {
    const shareUrl = window.location.href;
    const title = document.title;
    const url = new URL(
      platform === "facebook"
        ? "https://www.facebook.com/sharer/sharer.php"
        : platform === "x"
          ? "https://twitter.com/intent/tweet"
          : "https://wa.me/",
    );

    if (platform === "facebook") {
      url.searchParams.set("u", shareUrl);
    }

    if (platform === "x") {
      url.searchParams.set("text", title);
      url.searchParams.set("url", shareUrl);
    }

    if (platform === "whatsapp") {
      url.searchParams.set("text", `${title} ${shareUrl}`);
    }

    window.open(
      url.toString(),
      "_blank",
      "noopener,noreferrer,width=600,height=420",
    );
    setIsOpen(false);
  }

  async function handleCopyLink() {
    const shareUrl = window.location.href;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("error");
    } finally {
      setIsOpen(false);
    }
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-y py-5">
      <button
        type="button"
        onClick={handleLike}
        disabled={count === null || unavailable || liked || isSubmitting}
        aria-pressed={liked}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-rose-500 aria-pressed:bg-rose-50 aria-pressed:text-rose-700 dark:aria-pressed:bg-rose-950/30 dark:aria-pressed:text-rose-300"
      >
        <Heart
          className={`size-4 ${liked ? "fill-current" : ""}`}
          aria-hidden="true"
        />
        {count === null
          ? unavailable
            ? text.unavailable
            : text.loading
          : liked
            ? text.liked
            : text.like}
      </button>

      {count !== null && (
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {new Intl.NumberFormat(locale).format(count)} {text.likes}
        </span>
      )}

      <div ref={menuRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label={text.openMenu}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Share2 className="size-4" aria-hidden="true" />
          <span>
            {shareStatus === "copied"
              ? text.copied
              : shareStatus === "error"
                ? text.failed
                : text.share}
          </span>
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-md border bg-background shadow-lg">
            <button
              type="button"
              onClick={() => handleSocialShare("facebook")}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <Facebook className="size-4" aria-hidden="true" />
              {text.facebook}
            </button>
            <button
              type="button"
              onClick={() => handleSocialShare("x")}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <Twitter className="size-4" aria-hidden="true" />
              {text.x}
            </button>
            <button
              type="button"
              onClick={() => handleSocialShare("whatsapp")}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {text.whatsapp}
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 border-t px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <Copy className="size-4" aria-hidden="true" />
              {text.copy}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
