-- Execute no SQL Editor do Supabase para habilitar artigos fixados.
alter table public.articles
  add column if not exists is_pinned boolean not null default false;

drop function if exists public.search_articles(text, text, text, text, text, integer, integer);

create function public.search_articles(
  p_q text default null,
  p_category_slug text default null,
  p_tag_slug text default null,
  p_author_slug text default null,
  p_sort text default 'recent',
  p_page int default 1,
  p_per_page int default 9
) returns table (
  id uuid, title text, slug text, excerpt text, cover_image_url text,
  published_at timestamptz, is_pinned boolean, reading_minutes int,
  author_name text, category_name text, category_slug text, tags json,
  total_count bigint
) language sql stable as $$
  with base as (
    select a.id, a.title, a.slug, a.excerpt, a.cover_image_url,
      a.published_at, a.is_pinned, a.reading_minutes,
      p.full_name as author_name,
      c.name as category_name, c.slug as category_slug,
      coalesce(
        (select json_agg(json_build_object('name', t.name, 'slug', t.slug))
         from public.article_tags at2 join public.tags t on t.id = at2.tag_id
         where at2.article_id = a.id), '[]'::json) as tags,
      count(*) over() as total_count,
      to_tsvector('portuguese', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'')) as ts_head
    from public.articles a
    join public.profiles p on p.id = a.author_id
    left join public.categories c on c.id = a.category_id
    where a.status = 'published'
      and (p_category_slug is null or c.slug = p_category_slug)
      and (p_tag_slug is null or exists (
        select 1 from public.article_tags at3
        join public.tags t3 on t3.id = at3.tag_id
        where at3.article_id = a.id and t3.slug = p_tag_slug
      ))
      and (p_author_slug is null or lower(replace(p.full_name,' ','-')) = p_author_slug)
      and (p_q is null or (
        to_tsvector('portuguese',
          coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content_md,''))
          @@ websearch_to_tsquery('portuguese', p_q)
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
    case when p_sort = 'relevance' and p_q is not null
      then ts_rank(ts_head, websearch_to_tsquery('portuguese', p_q)) end desc nulls last
  offset (greatest(p_page, 1) - 1) * p_per_page
  limit p_per_page;
$$;

grant execute on function public.search_articles to anon, authenticated;