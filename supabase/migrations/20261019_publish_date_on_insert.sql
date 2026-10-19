create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    if tg_op = 'INSERT' then
      new.published_at = now();
    elsif old.published_at is null then
      new.published_at = now();
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before insert or update on public.articles
  for each row execute function public.touch_updated_at();