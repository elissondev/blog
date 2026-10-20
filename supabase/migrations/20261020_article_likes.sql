create table if not exists public.article_likes (
  translation_group_id uuid not null,
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (translation_group_id, voter_id)
);

alter table public.article_likes enable row level security;

create or replace function public.article_like_state(
  p_article_id uuid,
  p_voter_id uuid
) returns table (like_count bigint, liked boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_translation_group_id uuid;
begin
  select translation_group_id into v_translation_group_id
  from public.articles
  where id = p_article_id and status = 'published';
  if not found then return; end if;

  return query
  select count(*)::bigint,
    exists (
      select 1 from public.article_likes
      where translation_group_id = v_translation_group_id and voter_id = p_voter_id
    )
  from public.article_likes
  where translation_group_id = v_translation_group_id;
end; $$;

create or replace function public.like_article(
  p_article_id uuid,
  p_voter_id uuid
) returns table (like_count bigint, liked boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_translation_group_id uuid;
begin
  select translation_group_id into v_translation_group_id
  from public.articles
  where id = p_article_id and status = 'published';
  if not found then return; end if;

  insert into public.article_likes (translation_group_id, voter_id)
  values (v_translation_group_id, p_voter_id)
  on conflict (translation_group_id, voter_id) do nothing;

  return query
  select count(*)::bigint, true
  from public.article_likes
  where translation_group_id = v_translation_group_id;
end; $$;

revoke all on public.article_likes from anon, authenticated;
revoke all on function public.article_like_state(uuid, uuid) from public;
revoke all on function public.like_article(uuid, uuid) from public;
grant execute on function public.article_like_state(uuid, uuid) to anon, authenticated;
grant execute on function public.like_article(uuid, uuid) to anon, authenticated;