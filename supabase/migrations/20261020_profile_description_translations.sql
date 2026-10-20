alter table public.profiles
  add column if not exists description_en text not null default '',
  add column if not exists description_es text not null default '',
  add column if not exists article_description_es text not null default '';