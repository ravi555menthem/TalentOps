-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('payslips', 'payslips', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- DROP existing policies to avoid conflicts
drop policy if exists "Executives and Managers can upload payslips" on storage.objects;
drop policy if exists "Executives and Managers can update payslips" on storage.objects;
drop policy if exists "Executives and Managers can delete payslips" on storage.objects;
drop policy if exists "Authenticated users can view payslips" on storage.objects;
drop policy if exists "Public Access (if needed)" on storage.objects;

-- 1. VIEW POLICY: Allow authenticated users to view payslips (since we use signed URLs or public URLs)
create policy "Authenticated users can view payslips"
on storage.objects for select
to authenticated
using ( bucket_id = 'payslips' );

-- 2. UPLOAD POLICY: Allow Executives and Managers to upload
create policy "Executives and Managers can upload payslips"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payslips' and
  (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('executive', 'manager', 'admin')
    )
  )
);

-- 3. UPDATE POLICY
create policy "Executives and Managers can update payslips"
on storage.objects for update
to authenticated
using (
  bucket_id = 'payslips' and
  (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('executive', 'manager', 'admin')
    )
  )
);

-- 4. DELETE POLICY
create policy "Executives and Managers can delete payslips"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'payslips' and
  (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('executive', 'manager', 'admin')
    )
  )
);
