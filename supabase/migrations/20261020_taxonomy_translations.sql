alter table public.categories
  add column if not exists name_en text,
  add column if not exists slug_en text,
  add column if not exists description_en text,
  add column if not exists name_es text,
  add column if not exists slug_es text,
  add column if not exists description_es text;

alter table public.tags
  add column if not exists name_en text,
  add column if not exists slug_en text,
  add column if not exists name_es text,
  add column if not exists slug_es text;

create unique index if not exists categories_slug_en_key
  on public.categories (slug_en) where slug_en is not null;
create unique index if not exists categories_slug_es_key
  on public.categories (slug_es) where slug_es is not null;
create unique index if not exists tags_slug_en_key
  on public.tags (slug_en) where slug_en is not null;
create unique index if not exists tags_slug_es_key
  on public.tags (slug_es) where slug_es is not null;

drop function if exists public.search_articles(text, text, text, text, text, integer, integer, text);

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
      and (p_tag_slug is null or exists (
        select 1 from article_tags at3 join tags t3 on t3.id = at3.tag_id
        where at3.article_id = a.id and
          (case p_language_code
            when 'en' then coalesce(t3.slug_en, t3.slug)
            when 'es' then coalesce(t3.slug_es, t3.slug)
            else t3.slug
          end) = p_tag_slug))
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