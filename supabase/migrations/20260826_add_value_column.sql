-- Counter trophies (e.g. "59 of 100 suits") store their numeric progress
-- in this column. Run once in the Supabase SQL editor on existing projects;
-- fresh installs get it from schema.sql.
alter table progress add column if not exists value integer;
