"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOCALE_CONFIG, type ArticleLanguage } from "@/lib/locales";

const languages: ArticleLanguage[] = ["pt-BR", "en", "es"];
const flags: Record<ArticleLanguage, string> = {
  "pt-BR": "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

export function LanguageSwitcher({
  currentLanguage,
  label,
}: {
  currentLanguage: ArticleLanguage;
  label: string;
}) {
  const router = useRouter();

  return (
    <nav aria-label={label}>
      <div
        className="relative flex size-9 items-center justify-center rounded-md border hover:bg-accent focus-within:ring-2 focus-within:ring-ring md:hidden"
        title={LOCALE_CONFIG[currentLanguage].label}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none text-base leading-none"
        >
          {flags[currentLanguage]}
        </span>
        <select
          aria-label={label}
          value={currentLanguage}
          onChange={(event) => {
            const language = event.target.value as ArticleLanguage;
            router.push(language === "pt-BR" ? "/" : `/${language}`);
          }}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        >
          {languages.map((language) => (
            <option
              key={language}
              value={language}
              lang={LOCALE_CONFIG[language].htmlLang}
              className="text-foreground"
            >
              {flags[language]} {LOCALE_CONFIG[language].label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden items-center gap-1 md:flex">
        {languages.map((language) => {
          const href = language === "pt-BR" ? "/" : `/${language}`;
          return (
            <Link
              key={language}
              href={href}
              hrefLang={LOCALE_CONFIG[language].htmlLang}
              aria-label={LOCALE_CONFIG[language].label}
              aria-current={language === currentLanguage ? "page" : undefined}
              title={LOCALE_CONFIG[language].label}
              className="flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
            >
              <span aria-hidden="true" className="text-base leading-none">
                {flags[language]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
