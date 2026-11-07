-- Accounts for logging in. Run once in the Supabase SQL Editor, after schema.sql.

-- A user is someone who can log in to the app. This is separate from members,
-- who are the people borrowing books. The password is only ever stored hashed.
create table users (
  id integer generated always as identity primary key,
  name text not null check (btrim(name) <> ''),
  email text not null check (btrim(email) <> ''),
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- One account per email, even typed in different capitals.
create unique index users_email_unique on users (lower(email));

-- A session is one logged-in browser. Only a hash of its token is stored, so a
-- leaked copy of this table can't be used to log in. Deleting a user logs them out.
create table sessions (
  token_hash text primary key,
  user_id integer not null references users (id) on delete cascade,
  expires_at timestamptz not null
);
