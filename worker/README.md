# Rush VOD worker (beta)

Turns the hype moments detected live on the dashboard into real video clips
cut from the broadcaster's Twitch VOD, uploaded to Supabase Storage.

This is a standalone script, not a Vercel API route: downloading a VOD and
cutting clips out of it can take minutes for a long stream, which is way
past what a serverless function is allowed to run.

## One-time setup

1. Install the external tools this script shells out to:
   - [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) — resolves a `twitch.tv/videos/<id>`
     page into a downloadable stream (Twitch's Helix API doesn't expose VOD
     files directly to third-party apps).
   - `ffmpeg` — cuts the downloaded VOD into short clips.
2. Run the SQL migration in `supabase/migrations/20260905_rush_vod_pipeline.sql`
   from the Supabase SQL Editor (adds the `rush_moments` table + a couple of
   columns).
3. Make sure the broadcaster has **"Store past broadcasts"** enabled in the
   Twitch Creator Dashboard (Settings → Stream). Without it, Twitch keeps no
   VOD at all and there is nothing to download.
4. Have a `.env` file at the project root with the same variables the app
   uses: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`.

## Running it for a beta test

1. On the dashboard, connect the chat (`Connect chat`) for the stream you
   want to test — this creates a `streams` row and starts logging hype
   moments to `rush_moments` whenever the hype score spikes.
2. Stream, then click `Stop` (or just close the tab) once it's over.
3. Grab the `stream_id` from the `streams` table in Supabase (most recent
   row for that user).
4. Run:
   ```bash
   npm run worker:process-vod -- <stream_id>
   ```
5. Watch `/rush` — moments show "Processing..." until this script finishes,
   then flip to a playable clip.

## Known beta limitations

- `ffmpeg -c copy` cuts on the nearest keyframe, so clip boundaries can be
  off by a second or two — fine for a beta, worth revisiting with a re-encode
  if frame-accurate cuts matter later.
- The Storage bucket (`rush-clips`) is created **public** for simplicity.
  Move to private + signed URLs before real customer data goes through this.
- No retry/queueing: this is a manually-triggered script for the beta. A
  real deployment would run this on a small always-on worker (Fly.io,
  Railway, a VPS...) triggered automatically when a stream ends.
