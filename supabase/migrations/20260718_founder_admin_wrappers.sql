-- Founder-facing wrappers for internal maintenance jobs.
-- tick() and promote_waitlists() remain unavailable to normal authenticated users.

create or replace function public.founder_run_tick()
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_founder() then raise exception 'founders only'; end if;
  perform public.tick();
end $$;

create or replace function public.founder_promote_waitlists()
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not public.is_founder() then raise exception 'founders only'; end if;
  perform public.promote_waitlists();
end $$;

revoke execute on function public.founder_run_tick(), public.founder_promote_waitlists()
from public, anon;
grant execute on function public.founder_run_tick(), public.founder_promote_waitlists()
to authenticated;
