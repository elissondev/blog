-- ============================================================
-- NeuroBlog — Schema Supabase (colar no SQL Editor do Studio)
-- Execute UMA vez em um projeto Supabase novo.
-- ============================================================

-- ---------- Perfis (espelho de auth.users, com role) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'author' check (role in ('admin','author')),
  created_at timestamptz not null default now()
);

-- ---------- Categorias ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  created_at timestamptz not null default now()
);

-- ---------- Tags ----------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- Artigos ----------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content_md text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  reading_minutes int not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_published_idx
  on public.articles (status, published_at desc);
create index if not exists articles_search_idx
  on public.articles using gin (to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,'')));

-- ---------- Junção artigo <-> tags ----------
create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- ---------- Trigger: criar profile ao signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    -- o PRIMEIRO usuário criado vira admin automaticamente
    case when not exists (select 1 from public.profiles) then 'admin' else 'author' end
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Trigger: atualizar updated_at / published_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'published' and old.published_at is null then
    new.published_at = now();
  end if;
  return new;
end; $$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

-- ---------- RPC: listagem paginada com busca + filtros ----------
-- (usa aliases nos parâmetros para não conflitar com nomes de colunas)
create or replace function public.search_articles(
  p_q text default null,
  p_category_slug text default null,
  p_tag_slug text default null,
  p_author_slug text default null,
  p_sort text default 'recent',
  p_page int default 1,
  p_per_page int default 9
) returns table (
  id uuid, title text, slug text, excerpt text, cover_image_url text,
  published_at timestamptz, reading_minutes int,
  author_name text, category_name text, category_slug text, tags json,
  total_count bigint
) language sql stable as $$
  with base as (
    select a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
      a.published_at, a.reading_minutes,
      p.full_name as author_name,
      c.name as category_name, c.slug as category_slug,
      coalesce(
        (select json_agg(json_build_object('name', t.name, 'slug', t.slug))
         from article_tags at2 join tags t on t.id = at2.tag_id
         where at2.article_id = a.id), '[]'::json) as tags,
      count(*) over() as total_count,
      to_tsvector('portuguese', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'')) as ts_head
    from articles a
    join profiles p on p.id = a.author_id
    left join categories c on c.id = a.category_id
    where a.status = 'published'
      and (p_category_slug is null or c.slug = p_category_slug)
      and (p_tag_slug     is null or exists (
             select 1 from article_tags at3 join tags t3 on t3.id = at3.tag_id
             where at3.article_id = a.id and t3.slug = p_tag_slug))
      and (p_author_slug  is null or lower(replace(p.full_name,' ','-')) = p_author_slug)
      and (p_q is null or (
             to_tsvector('portuguese',
               coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content_md,''))
               @@ websearch_to_tsquery('portuguese', p_q)
             or a.title ilike '%' || p_q || '%'
           ))
  )
  select id, title, slug, excerpt, cover_image_url, published_at, reading_minutes,
         author_name, category_name, category_slug, tags, total_count
  from base
  order by
    case when p_sort = 'oldest' then published_at end asc,
    case when p_sort = 'title'   then lower(title)  end asc,
    case when p_sort = 'recent'  then published_at  end desc nulls last,
    case when p_sort = 'relevance' and p_q is not null
         then ts_rank(ts_head, websearch_to_tsquery('portuguese', p_q)) end desc nulls last
  offset (greatest(p_page,1)-1) * p_per_page
  limit p_per_page;
$$;

-- ---------- RLS ----------
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.tags       enable row level security;
alter table public.articles   enable row level security;
alter table public.article_tags enable row level security;

create policy "profiles_read"  on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

create policy "categories_read" on public.categories for select using (true);
create policy "tags_read"       on public.tags for select using (true);
create policy "article_tags_read" on public.article_tags for select using (true);

create policy "articles_read"
  on public.articles for select using (status = 'published' or author_id = auth.uid());

create policy "articles_insert"  on public.articles for insert to authenticated with check (author_id = auth.uid());
create policy "articles_update" on public.articles for update to authenticated using (author_id = auth.uid());
create policy "articles_delete"  on public.articles for delete to authenticated using (author_id = auth.uid());
create policy "article_tags_write" on public.article_tags to authenticated using (exists (select 1 from articles a where a.id = article_id and a.author_id = auth.uid()));

create policy "categories_write" on public.categories to authenticated using (true);
create policy "tags_write"       on public.tags to authenticated using (true);

grant execute on function public.search_articles to anon, authenticated;

-- ---------- Storage: bucket de imagens (público) ----------
insert into storage.buckets (id, name, public) values ('article-images','article-images', true)
on conflict (id) do nothing;

create policy "images_read" on storage.objects for select using (bucket_id = 'article-images');
create policy "images_upload_auth" on storage.objects for insert to authenticated with check (bucket_id = 'article-images');

-- ---------- Seed de exemplo ----------
insert into public.categories (name, slug, description) values
  ('Neurociência','neurociencia','Estudos sobre o cérebro e o sistema nervoso'),
  ('Saúde Mental','saude-mental','Bem-estar, terapia e equilíbrio emocional'),
  ('Produtividade','produtividade','Métodos e hábitos para render mais'),
  ('Sono','sono','Ciência e higiene do sono')
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
  ('Cérebro','cerebro'),('Ansiedade','ansiedade'),('Foco','foco'),
  ('Hábitos','habitos'),('Meditação','meditacao'),('Memória','memoria')
on conflict (slug) do nothing;
