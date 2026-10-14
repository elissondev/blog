"use client";

import { useEffect, useRef, useState } from "react";

export function ExpandableText({
  text,
  className,
}: {
  text: string;
  className?: string;
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
          className="mt-2 text-sm font-semibold text-white underline underline-offset-4 hover:text-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {expanded ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </div>
  );
}
