alter table public.profiles
  add column if not exists article_description_en text not null default '';