-- Library Manager tables. Run once in the Supabase SQL Editor, before seed.sql.

-- An author has a name. The unique index below stops the same author being
-- added twice, even typed in different capitals ("chinua achebe").
create table authors (
  id integer generated always as identity primary key,
  name text not null check (btrim(name) <> '')
);
create unique index authors_name_unique on authors (lower(name));

-- A book has a title and belongs to a real author. The year is optional here;
-- the app checks that any year typed in is a real one.
create table books (
  id integer generated always as identity primary key,
  title text not null check (btrim(title) <> ''),
  year integer,
  author_id integer not null references authors (id)
);

-- A member has a name. The phone number is optional.
create table members (
  id integer generated always as identity primary key,
  name text not null check (btrim(name) <> ''),
  phone text
);

-- A loan links a book to a member. Deleting a book deletes its loans.
-- returned_on stays empty while the book is out.
create table loans (
  id integer generated always as identity primary key,
  book_id integer not null references books (id) on delete cascade,
  member_id integer not null references members (id),
  borrowed_on date not null default current_date,
  due_on date not null default current_date + 14,
  returned_on date
);

-- A book can have only one loan with an empty returned_on, so it can't be lent
-- twice at the same time. Returned loans don't count, so history can build up.
create unique index loans_one_open_per_book on loans (book_id) where returned_on is null;
