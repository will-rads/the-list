-- member_records: the counts behind the member score, readable by the member, founders, and venues the
-- member applied to (the same rule as the profiles_venue_applicants policy). The score math lives in
-- web/v3/score.js, so the member Profile, venue cards and demos share one formula. member_record()
-- stays for the 2026-09-20 production build until the next deploy.
create or replace function public.member_records(p_members uuid[])
returns table(member_id uuid, record jsonb)
language sql stable security definer set search_path to 'public' as $$
  select m.id, jsonb_build_object(
      'applications', count(a.id),
      'attended', count(a.id) filter (where a.status = 'checked_in'),
      'no_shows', count(a.id) filter (where a.status = 'no_show'),
      'avg_rating', round(avg(a.rating), 1),
      'stories_verified', (select count(*) from public.stories s
          join public.applications b on b.id = s.application_id
         where b.member_id = m.id and s.verdict = 'verified'),
      'stories_missed', (select count(*) from public.stories s
          join public.applications b on b.id = s.application_id
         where b.member_id = m.id and s.verdict = 'rejected'))
    from (select distinct unnest(p_members) as id) m
    left join public.applications a on a.member_id = m.id
   where m.id = auth.uid() or public.is_founder()
      or exists (select 1 from public.applications x
                   join public.events e on e.id = x.event_id
                  where x.member_id = m.id and e.venue_id in (select public.my_venue_ids()))
   group by m.id
$$;

revoke execute on function public.member_records(uuid[]) from public, anon, authenticated;
grant execute on function public.member_records(uuid[]) to authenticated;
