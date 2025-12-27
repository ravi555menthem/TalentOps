/*
  SETUP STORAGE FOR TASK PROOFS (SAFE MODE)
  -----------------------------------------
  1. Creates 'task-proofs' bucket if not exists.
  2. Safely re-creates policies (Drop if exists first).
*/

-- 1. Create Bucket
insert into storage.buckets (id, name, public)
values ('task-proofs', 'task-proofs', true)
on conflict (id) do nothing;

-- 2. Policy: Allow Authenticated Users to Upload
drop policy if exists "Authenticated Users can upload proofs" on storage.objects;
create policy "Authenticated Users can upload proofs"
on storage.objects for insert
with check (
  bucket_id = 'task-proofs' 
  and auth.role() = 'authenticated'
);

-- 3. Policy: Allow Authenticated Users to View/Download
drop policy if exists "Authenticated Users can view proofs" on storage.objects;
create policy "Authenticated Users can view proofs"
on storage.objects for select
using (
  bucket_id = 'task-proofs'
  and auth.role() = 'authenticated'
);

-- 4. Policy: Allow Users to Delete their own proofs (Optional)
drop policy if exists "Users can delete own proofs" on storage.objects;
create policy "Users can delete own proofs"
on storage.objects for delete
using (
  bucket_id = 'task-proofs'
  and auth.uid() = owner
);
