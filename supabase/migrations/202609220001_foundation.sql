-- Public editorial identifiers are seeded separately. Private data is owner-only.
create table public.stories (
  id text primary key,
  published boolean not null default false
);
create table public.saved_stories (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null references public.stories(id) on delete restrict,
  note text not null default '' check (char_length(note) <= 10000),
  saved_at timestamptz not null default now(),
  primary key (user_id, story_id)
);
create index saved_stories_user_date on public.saved_stories (user_id, saved_at desc);
alter table public.stories enable row level security;
alter table public.saved_stories enable row level security;
revoke all on public.stories from anon, authenticated;
revoke all on public.saved_stories from anon, authenticated;
grant select on public.stories to anon, authenticated;
grant select, insert, update, delete on public.saved_stories to authenticated;
create policy "Published story IDs are public" on public.stories for select to anon, authenticated using (published);
create policy "Read own library" on public.saved_stories for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save published stories" on public.saved_stories for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (select 1 from public.stories where id = story_id and published));
create policy "Edit own library" on public.saved_stories for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Remove own saves" on public.saved_stories for delete to authenticated using ((select auth.uid()) = user_id);
-- UPDATE cannot change identity and bypass the published-story insert policy.
create function public.keep_save_identity() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.user_id <> old.user_id or new.story_id <> old.story_id then
    raise exception 'A saved story identity cannot change';
  end if;
  return new;
end; $$;
create trigger keep_save_identity before update on public.saved_stories for each row execute function public.keep_save_identity();
