-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Then enable Realtime on the table: Dashboard -> Database -> Replication
-- -> add "progress" to the supabase_realtime publication.

create table if not exists progress (
  user_key    text        not null default 'travelle',
  game_slug   text        not null,
  item_id     text        not null,   -- trophy id, or "trophy-id::step-id"
  item_type   text        not null default 'trophy',  -- 'trophy' | 'step'
  done        boolean     not null default false,
  done_at     timestamptz,
  source      text        not null default 'manual',  -- 'manual' | 'psnprofiles'
  updated_at  timestamptz not null default now(),
  primary key (user_key, game_slug, item_id)
);

create index if not exists progress_game_idx on progress (user_key, game_slug);

alter table progress enable row level security;

-- Single-user site, anon key only. Scoped to the one user_key.
-- Accepted tradeoff per the handoff: nothing sensitive lives here.
create policy "own rows" on progress
  for all
  using  (user_key = current_setting('request.jwt.claims', true)::json->>'sub'
          or user_key = 'travelle')
  with check (true);
