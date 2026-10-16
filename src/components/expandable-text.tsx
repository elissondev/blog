"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ExpandableText({
  text,
  className,
  buttonClassName,
}: {
  text: string;
  className?: string;
  buttonClassName?: string;
}) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    if (expanded) return;

    const paragraph = paragraphRef.current;
    if (!paragraph) return;

    const measureOverflow = () => {
      setHasOverflow(paragraph.scrollHeight > paragraph.clientHeight + 1);
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(paragraph);
    return () => observer.disconnect();
  }, [expanded, text]);

  return (
    <div>
      <p
        ref={paragraphRef}
        className={`${className ?? ""} whitespace-pre-line ${expanded ? "" : "line-clamp-4"}`}
      >
        {text}
      </p>
      {hasOverflow && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={cn(
            "mt-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4",
            buttonClassName ??
              "text-white hover:text-emerald-100 focus-visible:outline-white",
          )}
        >
          {expanded ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </div>
  );
}
