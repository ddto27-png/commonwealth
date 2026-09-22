-- Register existing public stories; editorial text remains versioned in src/content/catalog.ts.
insert into public.stories (id,published) values
('coperni',true),
('corner',true),
('remento',true),
('osmo',true),
('blur',true),
('labyrinth',true),
('cities',true),
('winderen',true),
('ruefle',true),
('holosonics',true),
('ghost',true),
('cosmos',true),
('whering',true),
('airbuds',true),
('soundmap',true),
('timeleft',true),
('polycam',true),
('mymind',true),
('mantel',true)
on conflict (id) do nothing;
