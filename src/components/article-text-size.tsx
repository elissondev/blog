"use client";

import {
  createContext,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Minus, Plus } from "lucide-react";

const MIN_SCALE = 0.95;
const MAX_SCALE = 1.1;
const SCALE_STEP = 0.025;

const labels = {
  "pt-BR": {
    group: "Tamanho do texto do artigo",
    decrease: "Diminuir texto do artigo",
    reset: "Restaurar tamanho padrão do texto",
    increase: "Aumentar texto do artigo",
  },
  en: {
    group: "Article text size",
    decrease: "Decrease article text size",
    reset: "Reset article text to default size",
    increase: "Increase article text size",
  },
  es: {
    group: "Tamaño del texto del artículo",
    decrease: "Reducir el tamaño del texto del artículo",
    reset: "Restablecer el tamaño predeterminado del texto",
    increase: "Aumentar el tamaño del texto del artículo",
  },
} as const;

type Locale = keyof typeof labels;
type TextSizeContextValue = {
  scale: number;
  setScale: Dispatch<SetStateAction<number>>;
};

const TextSizeContext = createContext<TextSizeContextValue | null>(null);

export function ArticleTextSizeProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const style = { "--article-text-scale": scale } as CSSProperties;

  return (
    <TextSizeContext.Provider value={{ scale, setScale }}>
      <div className="article-text-sizer" style={style}>
        {children}
      </div>
    </TextSizeContext.Provider>
  );
}

export function ArticleTextSizeControls({ locale }: { locale: Locale }) {
  const context = useContext(TextSizeContext);
  if (!context) throw new Error("Article text controls need a provider");

  const copy = labels[locale];

  return (
    <div
      role="group"
      aria-label={copy.group}
      className="inline-flex items-center gap-1 text-muted-foreground"
    >
      <button
        type="button"
        aria-label={copy.decrease}
        disabled={context.scale <= MIN_SCALE}
        onClick={() =>
          context.setScale((scale) =>
            Math.max(MIN_SCALE, Number((scale - SCALE_STEP).toFixed(3))),
          )
        }
        className="inline-flex size-8 items-center justify-center rounded-md border border-transparent transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={copy.reset}
        disabled={context.scale === 1}
        onClick={() => context.setScale(1)}
        className="inline-flex size-8 items-center justify-center rounded-md border border-transparent text-sm font-semibold transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        A
      </button>
      <button
        type="button"
        aria-label={copy.increase}
        disabled={context.scale >= MAX_SCALE}
        onClick={() =>
          context.setScale((scale) =>
            Math.min(MAX_SCALE, Number((scale + SCALE_STEP).toFixed(3))),
          )
        }
        className="inline-flex size-8 items-center justify-center rounded-md border border-transparent transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
