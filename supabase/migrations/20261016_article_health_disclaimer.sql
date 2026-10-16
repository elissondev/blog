alter table public.articles
  add column if not exists show_health_disclaimer boolean not null default false;