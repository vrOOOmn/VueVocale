-- Private storage for scanned photos and generated TTS audio, each scoped to
-- a per-user folder (${auth.uid()}/...) via storage RLS.

insert into storage.buckets (id, name, public)
values ('scan-photos', 'scan-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('chat-audio', 'chat-audio', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own scan photos" on storage.objects;
create policy "Users can upload own scan photos"
  on storage.objects for insert
  with check (
    bucket_id = 'scan-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read own scan photos" on storage.objects;
create policy "Users can read own scan photos"
  on storage.objects for select
  using (
    bucket_id = 'scan-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload own chat audio" on storage.objects;
create policy "Users can upload own chat audio"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read own chat audio" on storage.objects;
create policy "Users can read own chat audio"
  on storage.objects for select
  using (
    bucket_id = 'chat-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
