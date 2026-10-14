create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(btrim(text)) between 1 and 1000),
  author text not null check (char_length(btrim(author)) between 1 and 120),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

drop policy if exists "quotes_read" on public.quotes;
drop policy if exists "quotes_insert" on public.quotes;
drop policy if exists "quotes_delete" on public.quotes;

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

grant select on public.quotes to anon, authenticated;
grant insert, delete on public.quotes to authenticated;