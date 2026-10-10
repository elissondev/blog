-- Execute no SQL Editor do Supabase para habilitar descrições de categoria.
alter table public.categories
  add column if not exists description text not null default '';

update public.categories
set description = ''
where description is null;

alter table public.categories
  alter column description set default '',
  alter column description set not null;