import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary prose-img:rounded-lg", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
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
              <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...props}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => {
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
              <img src={src} alt={alt ?? ""} className="h-auto w-full rounded-lg" loading="lazy" />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
