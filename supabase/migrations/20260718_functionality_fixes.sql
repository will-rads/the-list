-- Follow-up hardening for the 2026-07-18 full-functionality wave.

-- A night can only close after it starts and after applications are locked.
create or replace function public.close_event(p_event uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
declare r record; v_title text; v_venue uuid; v_price numeric; v_status text; v_starts timestamptz;
begin
  select title, venue_id, bundle_price, status, starts_at
    into v_title, v_venue, v_price, v_status, v_starts
    from public.events
   where id = p_event
     and (venue_id in (select public.my_venue_ids()) or public.is_founder());
  if v_title is null then raise exception 'not yours'; end if;
  if v_status <> 'locked' then raise exception 'lock applications before closing the night'; end if;
  if v_starts is null or v_starts > now() then raise exception 'the night has not started'; end if;

  update public.events set status = 'closed' where id = p_event;
  for r in update public.applications set status = 'not_selected'
             where event_id = p_event and status in ('applied','waitlist')
             returning member_id loop
    perform public.notify(r.member_id, 'not_selected', v_title,
      'This one filled up. More drops soon.', p_event);
  end loop;
  for r in update public.applications set status = 'no_show'
             where event_id = p_event and status = 'confirmed'
             returning member_id loop
    perform public.notify(r.member_id, 'no_show', 'Marked as a no-show — ' || v_title,
      'You confirmed but didn''t check in.', p_event);
  end loop;
  insert into public.bookings (event_id, venue_id, bundle_price)
    values (p_event, v_venue, v_price)
    on conflict (event_id) do nothing;
end $$;

-- A rejected proof can be replaced. Every upload returns to pending review.
create or replace function public.submit_story(p_app uuid, p_media text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare v_story uuid; v_title text; v_event uuid; r record;
begin
  if nullif(trim(p_media), '') is null then raise exception 'story proof is required'; end if;
  select s.id, e.title, e.id into v_story, v_title, v_event
    from public.stories s
    join public.applications a on a.id = s.application_id
    join public.events e on e.id = a.event_id
   where s.application_id = p_app
     and a.member_id = auth.uid()
     and s.verdict in ('pending', 'rejected');
  if v_story is null then raise exception 'no story due'; end if;

  update public.stories
     set media_url = p_media, verdict = 'pending', score = null,
         reason = null, breakdown = null
   where id = v_story;
  for r in select id from public.profiles where role = 'founder' loop
    perform public.notify(r.id, 'story_submitted', 'Story submitted — ' || v_title,
      'Review it in founder ops.', v_event);
  end loop;
end $$;

-- Founders cannot approve an empty Story row.
create or replace function public.review_story(p_story uuid, p_verdict text, p_reason text default null)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_founder() then raise exception 'founders only'; end if;
  if p_verdict not in ('verified', 'rejected') then raise exception 'invalid verdict'; end if;
  if not exists (
    select 1 from public.stories
     where id = p_story and verdict = 'pending'
       and nullif(trim(media_url), '') is not null
  ) then raise exception 'story proof is required'; end if;
  perform public.override_story(p_story, p_verdict, p_reason);
end $$;

-- PostgreSQL grants new functions to PUBLIC by default. Revoke that default
-- everywhere, then expose only the RPCs used by signed-in clients.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.apply_to_event(uuid), public.approve_member(uuid), public.cancel_application(uuid),
  public.cancel_event(uuid), public.check_in(uuid), public.close_applications(uuid),
  public.close_event(uuid), public.confirm_pick(uuid), public.create_invite_codes(integer),
  public.create_venue(uuid,text,text), public.decline_pick(uuid), public.delete_account(),
  public.delete_event(uuid), public.event_stats(), public.founder_promote_waitlists(),
  public.founder_run_tick(), public.is_founder(), public.mark_no_show(uuid),
  public.member_record(), public.my_role(), public.my_venue_ids(),
  public.pick_applicant(uuid), public.post_event(text,text,text,text,timestamptz,timestamptz,integer,numeric,integer,timestamptz,integer,integer,jsonb,text,boolean),
  public.rate_guest(uuid,integer), public.redeem_invite(text),
  public.reject_member(uuid,text), public.review_story(uuid,text,text),
  public.set_invoice_status(uuid,text), public.skip_applicant(uuid),
  public.submit_story(uuid,text), public.suspend_member(uuid,text),
  public.toggle_save(uuid),
  public.update_event(uuid,text,text,text,text,timestamptz,timestamptz,integer,numeric,integer,timestamptz,integer,integer,jsonb,text,boolean)
to authenticated;

-- Trigger, cron, and nested helpers remain callable only by their owner and
-- service-role. override_story is reachable only through review_story.
grant execute on all functions in schema public to service_role;
