-- Enable RLS on storage.objects if not already enabled (usually enabled by default)
-- alter table storage.objects enable row level security;

-- Policy to allow Executives and Managers to UPLOAD (INSERT) payslips
create policy "Executives and Managers can upload payslips"
on storage.objects for insert
with check (
  bucket_id = 'payslips' and
  auth.role() = 'authenticated' and
  (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and (role = 'executive' or role = 'manager' or role = 'admin')
    )
  )
);

-- Policy to allow Executives and Managers to UPDATE payslips
create policy "Executives and Managers can update payslips"
on storage.objects for update
using (
  bucket_id = 'payslips' and
  auth.role() = 'authenticated' and
  (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and (role = 'executive' or role = 'manager' or role = 'admin')
    )
  )
);

-- Policy to allow Executives and Managers to DELETE payslips
create policy "Executives and Managers can delete payslips"
on storage.objects for delete
using (
  bucket_id = 'payslips' and
  auth.role() = 'authenticated' and
  (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and (role = 'executive' or role = 'manager' or role = 'admin')
    )
  )
);

-- (Optional) If you want Employees to upload their OWN payslips (if self-service is allowed, though usually HR does it)
-- Uncomment below if needed:
/*
create policy "Employees can upload their own payslips"
on storage.objects for insert
with check (
  bucket_id = 'payslips' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);
*/
