-- ============================================================
-- NeuroBlog — Schema Supabase (colar no SQL Editor do Studio)
-- Execute UMA vez em um projeto Supabase novo.
-- ============================================================

-- ---------- Perfis (espelho de auth.users, com role) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  description text not null default '',
  article_description text not null default '',
  avatar_url text,
  role text not null default 'author' check (role in ('admin','author')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists description text not null default '';

alter table public.profiles
  add column if not exists article_description text not null default '';

-- ---------- Citações inspiradoras ----------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(btrim(text)) between 1 and 1000),
  author text not null check (char_length(btrim(author)) between 1 and 120),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Categorias ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  name_en text,
  slug_en text,
  description_en text,
  name_es text,
  slug_es text,
  description_es text,
  created_at timestamptz not null default now()
);

alter table public.categories
  add column if not exists description text not null default '';
update public.categories set description = '' where description is null;
alter table public.categories alter column description set default '';
alter table public.categories alter column description set not null;

-- ---------- Tags ----------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  name_en text,
  slug_en text,
  name_es text,
  slug_es text,
  created_at timestamptz not null default now()
);

create unique index if not exists categories_slug_en_key
  on public.categories (slug_en) where slug_en is not null;
create unique index if not exists categories_slug_es_key
  on public.categories (slug_es) where slug_es is not null;
create unique index if not exists tags_slug_en_key
  on public.tags (slug_en) where slug_en is not null;
create unique index if not exists tags_slug_es_key
  on public.tags (slug_es) where slug_es is not null;

-- ---------- Artigos ----------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  language_code text not null default 'pt-BR'
    constraint articles_language_code_check check (language_code in ('pt-BR','en','es')),
  translation_group_id uuid not null default gen_random_uuid(),
  excerpt text not null default '',
  content_md text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  show_health_disclaimer boolean not null default false,
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  reading_minutes int not null default 1,
  published_at timestamptz,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_language_slug_key unique (language_code, slug),
  constraint articles_translation_language_key unique (translation_group_id, language_code)
);

alter table public.articles
  add column if not exists is_pinned boolean not null default false;

alter table public.articles
  add column if not exists show_health_disclaimer boolean not null default false;

create index if not exists articles_status_published_idx
  on public.articles (status, published_at desc);
create index if not exists articles_search_idx
  on public.articles using gin (to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,'')))
  where language_code = 'pt-BR';
create index if not exists articles_search_en_idx
  on public.articles using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,'')))
  where language_code = 'en';
create index if not exists articles_search_es_idx
  on public.articles using gin (to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,'')))
  where language_code = 'es';
create index if not exists articles_translation_group_idx
  on public.articles (translation_group_id, language_code, status);

create or replace function public.ensure_translation_group_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.articles a
    where a.translation_group_id = new.translation_group_id
      and a.author_id <> new.author_id
  ) then
    raise exception 'Translation group must belong to the same author';
  end if;
  return new;
end; $$;

drop trigger if exists articles_translation_group_author on public.articles;
create trigger articles_translation_group_author
  before insert or update of translation_group_id, author_id on public.articles
  for each row execute function public.ensure_translation_group_author();

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
  if new.status = 'published' and new.published_at is null then
    if tg_op = 'INSERT' then
      new.published_at = now();
    elsif old.published_at is null then
      new.published_at = now();
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before insert or update on public.articles
  for each row execute function public.touch_updated_at();

-- ---------- RPC: listagem paginada com busca + filtros ----------
-- (usa aliases nos parâmetros para não conflitar com nomes de colunas)
drop function if exists public.search_articles(text, text, text, text, text, integer, integer);

create or replace function public.search_articles(
  p_q text default null,
  p_category_slug text default null,
  p_tag_slug text default null,
  p_author_slug text default null,
  p_sort text default 'recent',
  p_page int default 1,
  p_per_page int default 9,
  p_language_code text default 'pt-BR'
) returns table (
  id uuid, title text, slug text, excerpt text, cover_image_url text,
  published_at timestamptz, is_pinned boolean, reading_minutes int,
  author_name text, category_name text, category_slug text, tags json,
  total_count bigint
) language sql stable as $$
  with base as (
    select a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
      a.published_at, a.reading_minutes,
      a.is_pinned,
      p.full_name as author_name,
      case p_language_code
        when 'en' then coalesce(c.name_en, c.name)
        when 'es' then coalesce(c.name_es, c.name)
        else c.name
      end as category_name,
      case p_language_code
        when 'en' then coalesce(c.slug_en, c.slug)
        when 'es' then coalesce(c.slug_es, c.slug)
        else c.slug
      end as category_slug,
      coalesce(
        (select json_agg(json_build_object(
           'name', case p_language_code
             when 'en' then coalesce(t.name_en, t.name)
             when 'es' then coalesce(t.name_es, t.name)
             else t.name
           end,
           'slug', case p_language_code
             when 'en' then coalesce(t.slug_en, t.slug)
             when 'es' then coalesce(t.slug_es, t.slug)
             else t.slug
           end))
         from article_tags at2 join tags t on t.id = at2.tag_id
         where at2.article_id = a.id), '[]'::json) as tags,
      count(*) over() as total_count,
      to_tsvector(
        case a.language_code
          when 'en' then 'english'::regconfig
          when 'es' then 'spanish'::regconfig
          else 'portuguese'::regconfig
        end,
        coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'')) as ts_head
    from articles a
    join profiles p on p.id = a.author_id
    left join categories c on c.id = a.category_id
    where a.status = 'published'
      and a.language_code = p_language_code
      and (p_category_slug is null or
        (case p_language_code
          when 'en' then coalesce(c.slug_en, c.slug)
          when 'es' then coalesce(c.slug_es, c.slug)
          else c.slug
        end) = p_category_slug)
      and (p_tag_slug     is null or exists (
             select 1 from article_tags at3 join tags t3 on t3.id = at3.tag_id
             where at3.article_id = a.id and
               (case p_language_code
                 when 'en' then coalesce(t3.slug_en, t3.slug)
                 when 'es' then coalesce(t3.slug_es, t3.slug)
                 else t3.slug
               end) = p_tag_slug))
      and (p_author_slug  is null or lower(replace(p.full_name,' ','-')) = p_author_slug)
      and (p_q is null or (
             to_tsvector(
               case a.language_code
                 when 'en' then 'english'::regconfig
                 when 'es' then 'spanish'::regconfig
                 else 'portuguese'::regconfig
               end,
               coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content_md,''))
               @@ websearch_to_tsquery(
                 case a.language_code
                   when 'en' then 'english'::regconfig
                   when 'es' then 'spanish'::regconfig
                   else 'portuguese'::regconfig
                 end,
                 p_q)
             or a.title ilike '%' || p_q || '%'
           ))
  )
  select id, title, slug, excerpt, cover_image_url, published_at, is_pinned, reading_minutes,
         author_name, category_name, category_slug, tags, total_count
  from base
  order by
    case when p_category_slug is null and p_tag_slug is null then is_pinned end desc nulls last,
    case when p_sort = 'oldest' then published_at end asc,
    case when p_sort = 'title'   then lower(title)  end asc,
    case when p_sort = 'recent'  then published_at  end desc nulls last,
    case when p_sort = 'relevance' and p_q is not null
         then ts_rank(
           ts_head,
           websearch_to_tsquery(
             case p_language_code
               when 'en' then 'english'::regconfig
               when 'es' then 'spanish'::regconfig
               else 'portuguese'::regconfig
             end,
             p_q)) end desc nulls last
  offset (greatest(p_page,1)-1) * p_per_page
  limit p_per_page;
$$;

-- ---------- RLS ----------
alter table public.profiles   enable row level security;
alter table public.quotes     enable row level security;
alter table public.categories enable row level security;
alter table public.tags       enable row level security;
alter table public.articles   enable row level security;
alter table public.article_tags enable row level security;

create policy "profiles_read"  on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);
create policy "quotes_read" on public.quotes for select using (true);
create policy "quotes_insert" on public.quotes for insert to authenticated
  with check (created_by = auth.uid());
create policy "quotes_delete" on public.quotes for delete to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

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
grant select on public.quotes to anon, authenticated;
grant insert, delete on public.quotes to authenticated;

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
