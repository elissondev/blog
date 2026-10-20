import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

export function HealthDisclaimer({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside
      role="note"
      className="not-prose my-8 flex flex-col items-start gap-2 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 sm:flex-row sm:gap-3 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <TriangleAlert
        className="size-5 shrink-0 text-amber-700 sm:mt-0.5 dark:text-amber-300"
        aria-hidden="true"
      />
      <div>
        <strong>{title}</strong> {children}
      </div>
    </aside>
  );
}
