-- Starter data. Run once in the Supabase SQL Editor, after schema.sql.
-- Nobody runs this a second time: it would add every book and member again.

-- 5 authors.
insert into authors (name) values
  ('Chinua Achebe'),
  ('Wole Soyinka'),
  ('Chimamanda Ngozi Adichie'),
  ('Ngũgĩ wa Thiong''o'),
  ('Buchi Emecheta');

-- 10 books. Each one looks up its author's id by name.
insert into books (title, year, author_id)
select b.title, b.year, a.id
from (values
  ('Things Fall Apart', 1958, 'Chinua Achebe'),
  ('No Longer at Ease', 1960, 'Chinua Achebe'),
  ('Arrow of God', 1964, 'Chinua Achebe'),
  ('The Lion and the Jewel', 1963, 'Wole Soyinka'),
  ('Death and the King''s Horseman', 1975, 'Wole Soyinka'),
  ('Purple Hibiscus', 2003, 'Chimamanda Ngozi Adichie'),
  ('Half of a Yellow Sun', 2006, 'Chimamanda Ngozi Adichie'),
  ('Weep Not, Child', 1964, 'Ngũgĩ wa Thiong''o'),
  ('Petals of Blood', 1977, 'Ngũgĩ wa Thiong''o'),
  ('The Joys of Motherhood', 1979, 'Buchi Emecheta')
) as b (title, year, author_name)
join authors a on a.name = b.author_name;

-- 5 members. The phone numbers are made up, and one member has no phone.
insert into members (name, phone) values
  ('Ada Okafor', '0800 000 0001'),
  ('Tunde Bakare', '0800 000 0002'),
  ('Ngozi Eze', '0800 000 0003'),
  ('Ibrahim Musa', '0800 000 0004'),
  ('Grace Effiong', null);

-- 2 books on loan. Each one looks up its book and member ids by name.
insert into loans (book_id, member_id, borrowed_on, due_on)
select b.id, m.id, l.borrowed_on, l.borrowed_on + 14
from (values
  ('Things Fall Apart', 'Ada Okafor', current_date - 3),
  ('Purple Hibiscus', 'Tunde Bakare', current_date - 7)
) as l (book_title, member_name, borrowed_on)
join books b on b.title = l.book_title
join members m on m.name = l.member_name;
