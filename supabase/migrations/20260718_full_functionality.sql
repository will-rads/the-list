-- Full-functionality wave — 2026-07-18
-- APPLIED to project zrbakomzpuesifasuamb on 2026-07-18 (migrations: full_functionality_schema,
-- full_functionality_rpcs, full_functionality_trigger_tick, harden_rpc_grants) + SQL smoke test green.
-- This file is the reference copy. Idempotent where possible.
-- Excluded on purpose: creator-data provider port, Gemini story auto-scoring.

-- ============================================================
-- 1. SCHEMA
-- ============================================================

-- events: add 'locked' lifecycle stage + wizard fields
do $$ declare c text; begin
  select conname into c from pg_constraint
   where conrelid = 'public.events'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) like '%status%';
  if c is not null then execute format('alter table public.events drop constraint %I', c); end if;
end $$;
alter table public.events
  add constraint events_status_check check (status = any (array['draft','published','locked','closed','cancelled']));
alter table public.events
  add column if not exists closes_at timestamptz,
  add column if not exists mix_girls int,
  add column if not exists mix_guys int,
  add column if not exists brief jsonb,
  add column if not exists bundle text;

-- members may browse locked + closed rooms too ("List closed" state)
alter policy events_published on public.events using (status in ('published','locked','closed'));

-- applications: venue rating (0-10) at door / close
alter table public.applications
  add column if not exists rating int check (rating between 0 and 10);

-- venues: identity + editable assets
alter table public.venues
  add column if not exists kind text,
  add column if not exists description text,
  add column if not exists ig_handle text,
  add column if not exists gallery jsonb not null default '[]'::jsonb;
drop policy if exists venues_update_own on public.venues;
create policy venues_update_own on public.venues
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
revoke update on public.venues from authenticated, anon;
grant update (name, kind, area, description, image_url, gallery, ig_handle) on public.venues to authenticated;

-- profiles: notif prefs + member number + SECURITY FIX
-- (old table-wide grant let a member UPDATE their own status/reputation = self-approval hole)
alter table public.profiles
  add column if not exists notif_picks boolean not null default true,
  add column if not exists notif_drops boolean not null default true;
alter table public.profiles add column if not exists member_no int generated always as identity;
revoke update on public.profiles from authenticated, anon;
grant update (full_name, ig_handle, phone, avatar_url, notif_picks, notif_drops) on public.profiles to authenticated;
-- old with_check (role='member') blocked venue/founder self-edits; columns are grant-limited now
alter policy profiles_update_own on public.profiles with check (id = auth.uid());

-- realtime: approval queue listens to its own profiles row
do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; end $$;

-- storage: one public media bucket (avatars, event heroes, venue galleries, story proofs)
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media write own folder" on storage.objects;
create policy "media write own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "media update own folder" on storage.objects;
create policy "media update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "media delete own folder" on storage.objects;
create policy "media delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 2. RPCs — new + replaced (house style: SECURITY DEFINER, notify() inside)
-- ============================================================

-- notify(): now respects member notification prefs
create or replace function public.notify(p_user uuid, p_kind text, p_title text, p_body text, p_event uuid)
returns void language sql security definer set search_path to 'public' as $$
  insert into public.notifications (user_id, kind, title, body, event_id)
  select p_user, p_kind, p_title, p_body, p_event
  where not exists (
    select 1 from public.profiles pr where pr.id = p_user
      and ((p_kind = 'new_drop' and pr.notif_drops = false)
        or (p_kind in ('picked','confirm_reminder') and pr.notif_picks = false)))
$$;

-- post_event: extended (closes_at, mix, brief, bundle, drafts). Old 9-arg version dropped.
drop function if exists public.post_event(text,text,text,text,timestamptz,timestamptz,integer,numeric,integer);
create or replace function public.post_event(
  p_title text, p_kind text, p_description text, p_image text,
  p_starts timestamptz, p_ends timestamptz, p_seats int, p_price numeric, p_story_hours int,
  p_closes_at timestamptz default null, p_mix_girls int default null, p_mix_guys int default null,
  p_brief jsonb default null, p_bundle text default null, p_draft boolean default false)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_venue uuid; v_id uuid;
begin
  select id into v_venue from public.venues where owner_id = auth.uid() limit 1;
  if v_venue is null then raise exception 'no venue'; end if;
  insert into public.events (venue_id, title, kind, description, image_url, starts_at, ends_at,
    seats, bundle_price, story_window_hours, closes_at, mix_girls, mix_guys, brief, bundle, status)
  values (v_venue, p_title, p_kind, p_description, p_image, p_starts, p_ends,
    coalesce(p_seats, 20), coalesce(p_price, 0), coalesce(p_story_hours, 24),
    p_closes_at, p_mix_girls, p_mix_guys, p_brief, p_bundle,
    case when p_draft then 'draft' else 'published' end)
  returning id into v_id;
  return v_id;
end $$;

-- update_event: edit drafts and published events; p_publish flips draft -> published
create or replace function public.update_event(
  p_event uuid, p_title text, p_kind text, p_description text, p_image text,
  p_starts timestamptz, p_ends timestamptz, p_seats int, p_price numeric, p_story_hours int,
  p_closes_at timestamptz default null, p_mix_girls int default null, p_mix_guys int default null,
  p_brief jsonb default null, p_bundle text default null, p_publish boolean default false)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  update public.events set
    title = p_title, kind = p_kind, description = p_description,
    image_url = coalesce(p_image, image_url),
    starts_at = p_starts, ends_at = p_ends,
    seats = coalesce(p_seats, seats),
    bundle_price = coalesce(p_price, bundle_price),
    story_window_hours = coalesce(p_story_hours, story_window_hours),
    closes_at = p_closes_at, mix_girls = p_mix_girls, mix_guys = p_mix_guys,
    brief = p_brief, bundle = p_bundle,
    status = case when p_publish and status = 'draft' then 'published' else status end
  where id = p_event and venue_id in (select public.my_venue_ids())
    and status in ('draft','published');
  if not found then raise exception 'not editable'; end if;
end $$;

-- delete_event: drafts only
create or replace function public.delete_event(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  delete from public.events
   where id = p_event and venue_id in (select public.my_venue_ids()) and status = 'draft';
  if not found then raise exception 'only drafts can be deleted'; end if;
end $$;

-- cancel_event: venue or founder; the on_event_published trigger fans out "Cancelled" notifs
create or replace function public.cancel_event(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare v_title text;
begin
  update public.events set status = 'cancelled'
   where id = p_event and (venue_id in (select public.my_venue_ids()) or public.is_founder())
     and status in ('draft','published','locked')
   returning title into v_title;
  if v_title is null then raise exception 'not cancellable'; end if;
  update public.applications set status = 'cancelled'
   where event_id = p_event and status in ('applied','waitlist','picked','confirmed');
end $$;

-- lock_event: internal core of "close applications" (no ownership check — execute revoked)
create or replace function public.lock_event(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare r record; v_title text;
begin
  update public.events set status = 'locked'
   where id = p_event and status = 'published' returning title into v_title;
  if v_title is null then return; end if;
  for r in update public.applications set status = 'waitlist'
            where event_id = p_event and status = 'applied'
            returning member_id loop
    perform public.notify(r.member_id, 'list_closed', 'List closed — ' || v_title,
      'You''re still under review.', p_event);
  end loop;
end $$;
revoke execute on function public.lock_event(uuid) from public, anon, authenticated;

-- close_applications: venue-facing wrapper with ownership check
create or replace function public.close_applications(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not exists (select 1 from public.events where id = p_event
                  and (venue_id in (select public.my_venue_ids()) or public.is_founder())) then
    raise exception 'not yours';
  end if;
  perform public.lock_event(p_event);
end $$;

-- mark_no_show: Door action, confirmed -> no_show
create or replace function public.mark_no_show(p_app uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare v_member uuid; v_event uuid; v_title text;
begin
  select a.member_id, a.event_id, e.title into v_member, v_event, v_title
    from public.applications a join public.events e on e.id = a.event_id
   where a.id = p_app and e.venue_id in (select public.my_venue_ids()) and a.status = 'confirmed';
  if v_member is null then raise exception 'not markable'; end if;
  update public.applications set status = 'no_show' where id = p_app;
  perform public.notify(v_member, 'no_show', 'Marked as a no-show — ' || v_title,
    'No-shows affect future applications.', v_event);
end $$;

-- rate_guest: venue 0-10 score, feeds the member record
create or replace function public.rate_guest(p_app uuid, p_rating int)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if p_rating is null or p_rating < 0 or p_rating > 10 then raise exception 'rating 0-10'; end if;
  update public.applications a set rating = p_rating
    from public.events e
   where a.id = p_app and e.id = a.event_id
     and e.venue_id in (select public.my_venue_ids())
     and a.status in ('checked_in','no_show');
  if not found then raise exception 'not rateable'; end if;
end $$;

-- close_event: replaced — now also flips never-checked-in confirmed guests to no_show
create or replace function public.close_event(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare r record; v_title text; v_venue uuid; v_price numeric;
begin
  select title, venue_id, bundle_price into v_title, v_venue, v_price
    from public.events where id = p_event
     and (venue_id in (select public.my_venue_ids()) or public.is_founder());
  if v_title is null then raise exception 'not yours'; end if;
  update public.events set status = 'closed' where id = p_event;
  for r in update public.applications set status = 'not_selected'
             where event_id = p_event and status in ('applied','waitlist')
             returning member_id loop
    perform public.notify(r.member_id, 'not_selected', v_title, 'This one filled up. More drops soon.', p_event);
  end loop;
  for r in update public.applications set status = 'no_show'
             where event_id = p_event and status = 'confirmed'
             returning member_id loop
    perform public.notify(r.member_id, 'no_show', 'Marked as a no-show — ' || v_title,
      'You confirmed but didn''t check in.', p_event);
  end loop;
  insert into public.bookings (event_id, venue_id, bundle_price) values (p_event, v_venue, v_price)
    on conflict (event_id) do nothing;
end $$;

-- submit_story: member attaches proof; founders review in /admin (Gemini port stays dark)
create or replace function public.submit_story(p_app uuid, p_media text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare v_story uuid; v_title text; v_event uuid; r record;
begin
  select s.id, e.title, e.id into v_story, v_title, v_event
    from public.stories s
    join public.applications a on a.id = s.application_id
    join public.events e on e.id = a.event_id
   where s.application_id = p_app and a.member_id = auth.uid() and s.verdict = 'pending';
  if v_story is null then raise exception 'no story due'; end if;
  update public.stories set media_url = p_media where id = v_story;
  for r in select id from public.profiles where role = 'founder' loop
    perform public.notify(r.id, 'story_submitted', 'Story submitted — ' || v_title,
      'Review it in founder ops.', v_event);
  end loop;
end $$;

-- member_record: aggregates for the Profile "record" tab
create or replace function public.member_record()
returns jsonb language sql security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'applications', count(*),
    'attended', count(*) filter (where a.status = 'checked_in'),
    'no_shows', count(*) filter (where a.status = 'no_show'),
    'picked', count(*) filter (where a.status in ('picked','confirmed','checked_in','no_show')),
    'avg_rating', round(avg(a.rating) filter (where a.rating is not null), 1),
    'stories_verified', (select count(*) from public.stories s
        join public.applications b on b.id = s.application_id
       where b.member_id = auth.uid() and s.verdict = 'verified'),
    'stories_missed', (select count(*) from public.stories s
        join public.applications b on b.id = s.application_id
       where b.member_id = auth.uid() and s.verdict = 'rejected'))
  from public.applications a where a.member_id = auth.uid()
$$;

-- event_stats: applied/taken counts members are allowed to see (RLS hides other rows)
create or replace function public.event_stats()
returns table(event_id uuid, applied int, taken int)
language sql security definer set search_path to 'public' as $$
  select e.id,
         count(a.id) filter (where a.status <> 'cancelled')::int,
         count(a.id) filter (where a.status in ('picked','confirmed','checked_in'))::int
    from public.events e left join public.applications a on a.event_id = e.id
   where e.status in ('published','locked')
   group by e.id
$$;

-- set_invoice_status: founder marks pending/invoiced/paid; venue owner gets notified
create or replace function public.set_invoice_status(p_booking uuid, p_status text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare v_owner uuid; v_title text; v_event uuid;
begin
  if not public.is_founder() then raise exception 'founders only'; end if;
  update public.bookings set invoice_status = p_status where id = p_booking;
  if not found then raise exception 'no booking'; end if;
  select v.owner_id, e.title, e.id into v_owner, v_title, v_event
    from public.bookings b join public.venues v on v.id = b.venue_id
    join public.events e on e.id = b.event_id
   where b.id = p_booking;
  if v_owner is not null then
    perform public.notify(v_owner, 'invoice_' || p_status, 'Invoice ' || p_status || ' — ' || v_title, null, v_event);
  end if;
end $$;

-- suspend_member: founder kicks/pauses an approved member
create or replace function public.suspend_member(p_member uuid, p_reason text default null)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_founder() then raise exception 'founders only'; end if;
  update public.profiles set status = 'rejected' where id = p_member and role = 'member';
  if not found then raise exception 'no member'; end if;
  perform public.notify(p_member, 'account_paused', 'Your access is paused', p_reason, null);
end $$;

-- delete_account: member self-service anonymize + cancel open applications
-- ponytail: auth.users row survives (anon key can't delete it); true erasure = service-role job later
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  update public.profiles
     set full_name = 'Deleted member', ig_handle = null, phone = null,
         avatar_url = null, creator_data = null, status = 'rejected'
   where id = auth.uid();
  update public.applications set status = 'cancelled'
   where member_id = auth.uid() and status in ('applied','waitlist','picked','confirmed');
end $$;

-- ============================================================
-- 3. TRIGGER + TICK — replaced
-- ============================================================

-- on_event_published: also fan out new_drop when a draft is published via update_event
create or replace function public.on_event_published()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare r record;
begin
  if (tg_op = 'INSERT' and new.status = 'published')
     or (tg_op = 'UPDATE' and old.status = 'draft' and new.status = 'published') then
    for r in select id from public.profiles where role = 'member' and status = 'approved' loop
      perform public.notify(r.id, 'new_drop', 'New drop — ' || new.title, to_char(new.starts_at, 'FMDay HH24:MI'), new.id);
    end loop;
  elsif tg_op = 'UPDATE' and (old.starts_at <> new.starts_at or (new.status = 'cancelled' and old.status <> 'cancelled')) then
    for r in select distinct member_id as id from public.applications
              where event_id = new.id and status in ('applied','waitlist','picked','confirmed','checked_in')
             union select member_id from public.saves where event_id = new.id loop
      perform public.notify(r.id, 'event_changed',
        case when new.status = 'cancelled' then 'Cancelled — ' || new.title else 'Time changed — ' || new.title end,
        to_char(new.starts_at, 'FMDay HH24:MI'), new.id);
    end loop;
  end if;
  return new;
end $$;

-- tick: replaced — adds auto-lock of published events past closes_at (rest unchanged)
create or replace function public.tick()
returns void language plpgsql security definer set search_path to 'public' as $$
declare r record;
begin
  for r in select id from public.events
            where status = 'published' and closes_at is not null and closes_at < now() loop
    perform public.lock_event(r.id);
  end loop;

  for r in update public.applications a set status = 'expired'
            where a.status = 'picked' and a.pick_expires_at < now()
            returning a.id, a.member_id, a.event_id loop
    perform public.notify(r.member_id, 'pick_expired', 'Your pick expired',
      'The 24h window closed.', r.event_id);
    perform public.notify((select v.owner_id from public.events e join public.venues v on v.id = e.venue_id where e.id = r.event_id),
      'pick_expired_venue', 'A pick expired — seat back in your deck', null, r.event_id);
  end loop;

  perform public.promote_waitlists();

  for r in select a.id, a.member_id, a.event_id, e.title from public.applications a
             join public.events e on e.id = a.event_id
            where a.status = 'picked' and a.pick_expires_at < now() + interval '6 hours'
              and not exists (select 1 from public.notifications n where n.user_id = a.member_id
                              and n.event_id = a.event_id and n.kind = 'confirm_reminder') loop
    perform public.notify(r.member_id, 'confirm_reminder', '6 hours left — ' || r.title,
      'Confirm your seat before it expires.', r.event_id);
  end loop;

  for r in select a.id, a.member_id, a.event_id, e.title, a.pass_code from public.applications a
             join public.events e on e.id = a.event_id
            where a.status = 'confirmed' and e.starts_at::date = now()::date
              and not exists (select 1 from public.notifications n where n.user_id = a.member_id
                              and n.event_id = a.event_id and n.kind = 'pass_ready') loop
    perform public.notify(r.member_id, 'pass_ready', 'Tonight — ' || r.title,
      'Your pass ' || coalesce(r.pass_code,'') || ' is ready.', r.event_id);
  end loop;

  for r in select s.id, a.member_id, a.event_id, e.title from public.stories s
             join public.applications a on a.id = s.application_id
             join public.events e on e.id = a.event_id
            where s.verdict = 'pending' and s.media_url is null
              and s.due_at < now() + interval '3 hours' and s.due_at > now()
              and not exists (select 1 from public.notifications n where n.user_id = a.member_id
                              and n.event_id = a.event_id and n.kind = 'story_deadline') loop
    perform public.notify(r.member_id, 'story_deadline', '3 hours left — ' || r.title,
      'Post your story and tag the venue.', r.event_id);
  end loop;

  for r in update public.stories s set verdict = 'rejected', reason = 'No story detected in window'
            from public.applications a
           where a.id = s.application_id and s.verdict = 'pending' and s.media_url is null and s.due_at < now()
           returning a.member_id, a.event_id loop
    perform public.notify(r.member_id, 'story_missed', 'Story missed',
      'The posting window closed. This affects future applications.', r.event_id);
  end loop;

  for r in select v.owner_id, e.id as event_id, e.title, count(*) as n
             from public.applications a
             join public.events e on e.id = a.event_id
             join public.venues v on v.id = e.venue_id
            where a.created_at > now() - interval '24 hours' and e.status = 'published' and v.owner_id is not null
            group by v.owner_id, e.id, e.title loop
    if not exists (select 1 from public.notifications n where n.user_id = r.owner_id
                   and n.event_id = r.event_id and n.kind = 'applications_digest'
                   and n.created_at > now() - interval '20 hours') then
      perform public.notify(r.owner_id, 'applications_digest',
        r.n || ' new applicants — ' || r.title, null, r.event_id);
    end if;
  end loop;

  for r in select v.owner_id, e.id as event_id, e.title,
                  (select count(*) from public.applications x where x.event_id = e.id and x.status = 'confirmed') as n
             from public.events e join public.venues v on v.id = e.venue_id
            where e.status = 'published' and e.starts_at::date = now()::date and v.owner_id is not null
              and not exists (select 1 from public.notifications n2 where n2.user_id = v.owner_id
                              and n2.event_id = e.id and n2.kind = 'tonight_lineup') loop
    perform public.notify(r.owner_id, 'tonight_lineup', 'Tonight — ' || r.title,
      r.n || ' confirmed.', r.event_id);
  end loop;

  for r in select v.owner_id, e.id as event_id, e.title
             from public.events e join public.venues v on v.id = e.venue_id
            where e.status = 'closed' and v.owner_id is not null
              and not exists (select 1 from public.stories s join public.applications a on a.id = s.application_id
                              where a.event_id = e.id and s.verdict = 'pending')
              and exists (select 1 from public.stories s join public.applications a on a.id = s.application_id
                          where a.event_id = e.id)
              and not exists (select 1 from public.notifications n2 where n2.user_id = v.owner_id
                              and n2.event_id = e.id and n2.kind = 'post_event_report') loop
    perform public.notify(r.owner_id, 'post_event_report', 'Report ready — ' || r.title,
      'Stories, check-ins and no-shows.', r.event_id);
  end loop;
end $$;

-- ============================================================
-- 4. HARDENING (advisor-driven, applied same day)
-- ============================================================
-- anon cannot act (auth.uid() null) — revoke belt-and-braces. Helpers
-- (is_founder/my_role/my_venue_ids) stay executable: RLS policies evaluate them as the caller.
revoke execute on function
  public.apply_to_event(uuid), public.approve_member(uuid), public.cancel_application(uuid),
  public.cancel_event(uuid), public.check_in(uuid), public.close_applications(uuid),
  public.close_event(uuid), public.confirm_pick(uuid), public.create_invite_codes(integer),
  public.create_venue(uuid,text,text), public.decline_pick(uuid), public.delete_account(),
  public.delete_event(uuid), public.event_stats(), public.mark_no_show(uuid),
  public.member_record(), public.override_story(uuid,text,text), public.pick_applicant(uuid),
  public.rate_guest(uuid,integer), public.redeem_invite(text), public.reject_member(uuid,text),
  public.set_invoice_status(uuid,text), public.skip_applicant(uuid),
  public.submit_story(uuid,text), public.suspend_member(uuid,text), public.toggle_save(uuid),
  public.post_event(text,text,text,text,timestamptz,timestamptz,integer,numeric,integer,timestamptz,integer,integer,jsonb,text,boolean),
  public.update_event(uuid,text,text,text,text,timestamptz,timestamptz,integer,numeric,integer,timestamptz,integer,integer,jsonb,text,boolean)
from anon;

-- internal-only: cron/trigger/definer-context
revoke execute on function
  public.notify(uuid,text,text,text,uuid), public.tick(), public.promote_waitlists(),
  public.handle_new_user(), public.on_event_published()
from anon, authenticated;

-- public bucket serves objects by URL; the broad SELECT policy only enabled listing
drop policy if exists "media public read" on storage.objects;
