import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

function normalizedHeadingText(text: string): string {
  return text
    .replace(/\*\*|__|~~|[*_`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function headingText(children: ReactNode): string {
  const text = Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      if (isValidElement<{ children?: ReactNode }>(child))
        return headingText(child.props.children);
      return "";
    })
    .join("");
  return normalizedHeadingText(text);
}

function isReferencesHeading(children: ReactNode): boolean {
  return headingText(children).startsWith("referencias");
}

export function hasReferencesSection(content: string): boolean {
  return content.split(/\r?\n/).some((line) => {
    const match = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    return match
      ? normalizedHeadingText(match[1]).startsWith("referencias")
      : false;
  });
}

export function Markdown({
  content,
  className,
  beforeReferences,
}: {
  content: string;
  className?: string;
  beforeReferences?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert min-w-0 max-w-full wrap-anywhere prose-headings:font-serif prose-a:text-primary prose-img:rounded-lg",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h1: ({ children, ...props }) => (
            <>
              {beforeReferences && isReferencesHeading(children)
                ? beforeReferences
                : null}
              <h1 {...props}>{children}</h1>
            </>
          ),
          h2: ({ children, ...props }) => (
            <>
              {beforeReferences && isReferencesHeading(children)
                ? beforeReferences
                : null}
              <h2 {...props}>{children}</h2>
            </>
          ),
          h3: ({ children, ...props }) => (
            <>
              {beforeReferences && isReferencesHeading(children)
                ? beforeReferences
                : null}
              <h3 {...props}>{children}</h3>
            </>
          ),
          h4: ({ children, ...props }) => (
            <>
              {beforeReferences && isReferencesHeading(children)
                ? beforeReferences
                : null}
              <h4 {...props}>{children}</h4>
            </>
          ),
          h5: ({ children, ...props }) => (
            <>
              {beforeReferences && isReferencesHeading(children)
                ? beforeReferences
                : null}
              <h5 {...props}>{children}</h5>
            </>
          ),
          h6: ({ children, ...props }) => (
            <>
              {beforeReferences && isReferencesHeading(children)
                ? beforeReferences
                : null}
              <h6 {...props}>{children}</h6>
            </>
          ),
          table: ({ children, ...props }) => (
            <div className="my-6 max-w-full overflow-x-auto rounded-xl border border-border bg-card">
              <table
                {...props}
                className="w-max min-w-full border-separate border-spacing-0"
              >
                {children}
              </table>
            </div>
          ),
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className={cn("max-w-full overflow-x-auto", props.className)}
            >
              {children}
            </pre>
          ),
          a: ({ href, children, ...props }) => {
            const internal = href?.startsWith("/");
            if (internal) {
              return (
                <Link href={href!} {...props}>
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                {...props}
              >
                {children}
              </a>
            );
          },
          img: (props) => {
            const { alt } = props;
            const src = typeof props.src === "string" ? props.src : undefined;
            if (!src) return null;
            const isLocal = src.startsWith("/") || src.includes("supabase.co");
            return isLocal ? (
              <Image
                src={src}
                alt={alt ?? ""}
                width={1200}
                height={675}
                className="h-auto w-full rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt ?? ""}
                className="h-auto w-full rounded-lg"
                loading="lazy"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
