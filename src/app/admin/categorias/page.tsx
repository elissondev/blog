import { isSupabaseConfigured, createClientServer } from "@/lib/supabase/server";
import { demoCategories, demoTags } from "@/lib/demo-data";
import { CategoryManager, TagManager } from "@/components/admin/taxonomy-manager";
import type { Category, Tag } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTaxonomiesPage() {
  let categories: (Category & { count?: number })[] = [];
  let tags: (Tag & { count?: number })[] = [];

  if (!isSupabaseConfigured()) {
    categories = demoCategories.map((c) => ({ ...c, description: c.description ?? "" }));
    tags = demoTags;
  } else {
    const supabase = await createClientServer();
    const [{ data: cats }, { data: tg }] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
    ]);
    categories = cats ?? [];
    tags = tg ?? [];
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section aria-labelledby="h-cats" className="space-y-4">
        <div>
          <h1 id="h-cats" className="font-serif text-2xl font-bold">Categorias</h1>
          <p className="text-sm text-muted-foreground">Cada artigo pertence a uma categoria exibida na sidebar e nos cards.</p>
        </div>
        <CategoryManager categories={categories} />
      </section>
      <section aria-labelledby="h-tags" className="space-y-4">
        <div>
          <h2 id="h-tags" className="font-serif text-2xl font-bold">Tags</h2>
          <p className="text-sm text-muted-foreground">Tags podem ser múltiplas por artigo e geram páginas /tag/[slug].</p>
        </div>
        <TagManager tags={tags} />
      </section>
    </div>
  );
}
