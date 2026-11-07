-- Run once in Supabase, after schema.sql, seed.sql and auth.sql.

-- Supabase publishes tables in the public schema through its web API. Turning on
-- row level security with no policies means that API can't read or change them.
-- The app isn't affected: it connects as the table owner, who skips these rules.
alter table authors enable row level security;
alter table books enable row level security;
alter table members enable row level security;
alter table loans enable row level security;
alter table users enable row level security;
alter table sessions enable row level security;
