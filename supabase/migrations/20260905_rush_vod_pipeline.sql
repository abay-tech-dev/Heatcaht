-- Rush VOD pipeline (beta): track stream sessions and hype moments so a
-- post-stream worker can download the VOD and cut highlight clips around them.
--
-- Run this manually in the Supabase SQL Editor (Project → SQL Editor → New query).

-- Stream sessions already have a `streams` table (created earlier). Add the
-- columns needed to remember which Twitch VOD corresponds to a session.
alter table streams
  add column if not exists twitch_vod_id text,
  add column if not exists twitch_vod_url text;

-- Link scores to the stream session they were computed during, so the hype
-- timeline can be reviewed against a specific stream later.
alter table scores
  add column if not exists stream_id uuid references streams(id) on delete set null;

-- One row per detected hype spike during a stream. The worker script turns
-- each "pending" row into a downloaded, cut, and uploaded clip.
create table if not exists rush_moments (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references streams(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  hype_score int not null,
  occurred_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
  storage_path text,
  clip_url text,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create index if not exists rush_moments_stream_id_idx on rush_moments(stream_id);
create index if not exists rush_moments_user_id_idx on rush_moments(user_id);
create index if not exists rush_moments_status_idx on rush_moments(status);

-- RLS: service role (used by the app's server routes and the worker script)
-- bypasses RLS entirely, so this just keeps the table locked down for any
-- other key type. Adjust if you later query rush_moments from the browser.
alter table rush_moments enable row level security;
