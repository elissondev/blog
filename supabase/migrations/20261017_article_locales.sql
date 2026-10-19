alter table public.articles
  add column if not exists language_code text not null default 'pt-BR';

alter table public.articles
  add constraint articles_language_code_check
  check (language_code in ('pt-BR','en','es'));

alter table public.articles
  add column if not exists translation_group_id uuid;

update public.articles
set translation_group_id = id
where translation_group_id is null;

alter table public.articles
  alter column translation_group_id set default gen_random_uuid(),
  alter column translation_group_id set not null;

alter table public.articles
  drop constraint if exists articles_slug_key;

create unique index if not exists articles_language_slug_key
  on public.articles (language_code, slug);

create unique index if not exists articles_translation_language_key
  on public.articles (translation_group_id, language_code);

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

drop index if exists public.articles_search_idx;
create index articles_search_idx
  on public.articles using gin (
    to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,''))
  ) where language_code = 'pt-BR';
create index if not exists articles_search_en_idx
  on public.articles using gin (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,''))
  ) where language_code = 'en';
create index if not exists articles_search_es_idx
  on public.articles using gin (
    to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content_md,''))
  ) where language_code = 'es';

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
      a.published_at, a.reading_minutes, a.is_pinned,
      p.full_name as author_name,
      c.name as category_name, c.slug as category_slug,
      coalesce(
        (select json_agg(json_build_object('name', t.name, 'slug', t.slug))
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
      and (p_category_slug is null or c.slug = p_category_slug)
      and (p_tag_slug is null or exists (
        select 1 from article_tags at3 join tags t3 on t3.id = at3.tag_id
        where at3.article_id = a.id and t3.slug = p_tag_slug))
      and (p_author_slug is null or lower(replace(p.full_name,' ','-')) = p_author_slug)
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
  select id, title, slug, excerpt, cover_image_url, published_at, is_pinned,
    reading_minutes, author_name, category_name, category_slug, tags, total_count
  from base
  order by
    case when p_category_slug is null and p_tag_slug is null then is_pinned end desc nulls last,
    case when p_sort = 'oldest' then published_at end asc,
    case when p_sort = 'title' then lower(title) end asc,
    case when p_sort = 'recent' then published_at end desc nulls last,
    case when p_sort = 'relevance' and p_q is not null then
      ts_rank(ts_head, websearch_to_tsquery(
        case p_language_code
          when 'en' then 'english'::regconfig
          when 'es' then 'spanish'::regconfig
          else 'portuguese'::regconfig
        end, p_q)) end desc nulls last
  offset (greatest(p_page,1)-1) * p_per_page
  limit p_per_page;
$$;

grant execute on function public.search_articles to anon, authenticated;