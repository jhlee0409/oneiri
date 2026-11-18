-- Link a symbol reading (analysis report) to the dream it was made from.
-- One reading per dream; legacy free-text reports keep dream_id = null.
--
-- The existing RLS policy ("Users can only access their own analysis reports",
-- FOR ALL USING auth.uid() = user_id) still lets owners write their own rows
-- through the API. A plain FK on dream_id alone would let a user point their
-- report at someone else's dream and occupy that dream's unique slot, so the
-- FK is composite: dream_id must belong to the same user_id as the report.

create unique index if not exists dreams_id_user_id_key
  on public.dreams (id, user_id);

alter table public.analysis_reports
  add column if not exists dream_id uuid;

alter table public.analysis_reports
  add constraint analysis_reports_dream_owner_fkey
  foreign key (dream_id, user_id)
  references public.dreams (id, user_id)
  on delete set null (dream_id);

create index if not exists analysis_reports_user_id_dream_id_idx
  on public.analysis_reports (user_id, dream_id);

create unique index if not exists analysis_reports_dream_id_key
  on public.analysis_reports (dream_id)
  where dream_id is not null;
