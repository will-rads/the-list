import { supabaseClient } from '../client.js';


(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;
  const teaser = document.querySelector('.event');
  teaser.classList.add('loading');

  const fetchEvent = () => supabaseClient.from('events')
    .select('title,image_url,starts_at,kind,status,venues(name,area)')
    .eq('id', id).in('status', ['published', 'locked', 'closed']).maybeSingle();

  let result;
  try { result = await fetchEvent(); } catch (error) { result = { error }; }
  if (result.error) {
    try { result = await fetchEvent(); } catch (error) { result = { error }; }
  }
  teaser.classList.remove('loading');
  if (result.error) return;

  const data = result.data;
  const rope = document.querySelector('.rope');
  const cta = document.querySelector('.cta');
  if (!data) { rope.textContent = 'This event is gone.'; return; }

  const venue = data.venues || {};
  const when = data.starts_at ? new Intl.DateTimeFormat('en-LB', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(data.starts_at)) : '';
  const meta = [venue.name, venue.area, when].filter(Boolean).join(' · ');
  document.title = `${data.title} · The List`;
  document.querySelector('#title').textContent = data.title;
  document.querySelector('#title').hidden = false;
  document.querySelector('#meta').textContent = meta;
  document.querySelector('#meta').hidden = !meta;
  if (data.status === 'closed') {
    rope.textContent = 'This one is done. More drops soon.';
    cta.textContent = "See what's next";
    cta.href = '/';
  } else {
    cta.href = `/?event=${encodeURIComponent(id)}`;
  }
  if (data.image_url) {
    const image = document.querySelector('#event-image');
    image.src = data.image_url;
    image.alt = data.title;
    image.style.display = 'block';
  }
})().catch(() => { document.querySelector('.event').classList.remove('loading'); });
