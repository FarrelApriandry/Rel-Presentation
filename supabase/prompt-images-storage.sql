-- Prompt reference images storage setup (Supabase `images` bucket)
-- Run this in the Supabase SQL editor. The bucket is shared;
-- prompt uploads live under `prompt-images/{user_id}/...`
-- so users can only read/write their own folder.

-- 1. Create the bucket (idempotent). Public read so <img> URLs render
--    inside generated decks without signed URLs.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = excluded.public;

-- 2. Enable RLS on storage.objects (usually already enabled).
-- alter table storage.objects enable row level security;

-- 3. Drop old prompt-images policies if re-running.
drop policy if exists "prompt-images insert own folder" on storage.objects;
drop policy if exists "prompt-images read own folder" on storage.objects;
drop policy if exists "prompt-images delete own folder" on storage.objects;
drop policy if exists "prompt-images public read" on storage.objects;

-- 4a. If the `images` bucket is PUBLIC (recommended for deck <img> tags):
--     anyone can read, but only the owner can write/delete their folder.
create policy "prompt-images public read"
on storage.objects for select
using (bucket_id = 'images');

create policy "prompt-images insert own folder"
on storage.objects for insert
with check (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = 'prompt-images'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "prompt-images delete own folder"
on storage.objects for delete
using (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = 'prompt-images'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- 4b. If the `images` bucket must stay PRIVATE instead, replace 4a with:
-- create policy "prompt-images read own folder"
-- on storage.objects for select
-- using (
--   bucket_id = 'images'
--   and (storage.foldername(name))[1] = 'prompt-images'
--   and (storage.foldername(name))[2] = auth.uid()::text
-- );
-- NOTE: private buckets break deck <img> rendering because getPublicUrl
-- URLs will return 403. Prefer the public-bucket option above.

-- 5. Optional 50MB per-file guard at the storage layer
--    (app also validates client + server side).
-- alter table storage.objects add constraint if needed via dashboard;
-- Supabase bucket file-size limits are configured per-bucket in
-- Dashboard > Storage > images > Settings (set to 50MB).
