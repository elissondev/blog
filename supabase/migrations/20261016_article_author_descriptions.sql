alter table public.profiles
  add column if not exists article_description text not null default '';