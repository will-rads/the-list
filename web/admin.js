import { supabaseClient } from './client.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const date = value => value ? new Date(value).toLocaleString('en-LB') : '—';
const money = value => value == null ? '—' : `$${Number(value).toFixed(2)}`;
const empty = (rows, columns) => rows || `<tr><td colspan="${columns}">None</td></tr>`;
const igLink = handle => {
  const clean = (handle || '').replace(/^@/, '');
  return clean ? `<a class="ig" href="https://instagram.com/${encodeURIComponent(clean)}" target="_blank" rel="noopener">@${esc(clean)}</a>` : '—';
};
let storiesHistory = false;
let refreshTimer = null;
let refreshing = false;

function message(text, error = false) {
  $('#status').textContent = text;
  $('#status').style.color = error ? '#E8B24A' : '';
}

async function rpc(name, args, scope) {
  const controls = (scope || $('#ops')).querySelectorAll('button, select');
  controls.forEach(control => control.disabled = true);
  try {
    const { error } = await supabaseClient.rpc(name, args);
    if (error) throw error;
  } finally {
    controls.forEach(control => control.disabled = false);
  }
  message('Saved');
  await refresh();
}

async function loadMembers() {
  const q = $('#member-search').value.trim().replace(/[,()]/g, '');
  const status = $('#member-status').value;
  let query = supabaseClient.from('profiles')
    .select('id,member_no,full_name,ig_handle,phone,status,reputation,created_at')
    .eq('role', 'member').order('member_no').limit(200);
  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.or(`full_name.ilike.%${q}%,ig_handle.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) throw error;
  $('#members').innerHTML = empty(data.map(row => {
    const pause = row.status === 'approved' ? `<button class="secondary" data-pause="${esc(row.id)}">Pause</button>` : '';
    return `<tr><td>${esc(row.member_no ?? '—')}</td><td>${esc(row.full_name)}</td><td>${igLink(row.ig_handle)}</td><td>${esc(row.phone)}</td><td>${esc(row.status)}</td><td>${esc(row.reputation ?? '—')}</td><td>${date(row.created_at)}</td><td class="actions"><div>${pause}</div></td></tr>`;
  }).join(''), 8);
}

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    message('Refreshing…');
    let storiesQuery = supabaseClient.from('stories')
      .select('id,verdict,score,due_at,media_url,applications(member_id,profiles(full_name,ig_handle),events(title))')
      .order('due_at');
    if (!storiesHistory) storiesQuery = storiesQuery.eq('verdict', 'pending').not('media_url', 'is', null);
    const [pendingMembers, invites, stories, bookings, events, stats, venues, notifications] = await Promise.all([
      supabaseClient.from('profiles').select('id,full_name,ig_handle,phone,created_at').eq('status', 'pending').order('created_at'),
      supabaseClient.from('invite_codes').select('code,used_by,used_at').order('code'),
      storiesQuery,
      supabaseClient.from('bookings').select('id,bundle_price,cut_amount,invoice_status,events(title)').order('created_at', { ascending: false }),
      supabaseClient.from('events').select('id,title,status,starts_at,seats,venues(name)').order('starts_at', { ascending: false }).limit(100),
      supabaseClient.rpc('event_stats'),
      supabaseClient.from('venues').select('id,name,area,kind,ig_handle,owner_id').order('name'),
      supabaseClient.from('notifications').select('user_id,kind,title,created_at').order('created_at', { ascending: false }).limit(30)
    ]);
    const failed = [pendingMembers, invites, stories, bookings, events, stats, venues, notifications].find(result => result.error);
    if (failed) throw failed.error;

    const ids = [...new Set([
      ...invites.data.map(row => row.used_by),
      ...venues.data.map(row => row.owner_id),
      ...notifications.data.map(row => row.user_id)
    ].filter(Boolean))];
    const names = {};
    if (ids.length) {
      const lookup = await supabaseClient.from('profiles').select('id,full_name,ig_handle').in('id', ids);
      if (lookup.error) throw lookup.error;
      lookup.data.forEach(row => names[row.id] = row);
    }

    $('#applications').innerHTML = empty(pendingMembers.data.map(row => {
      const reasons = ['Not enough reach', 'Low engagement', 'Not the right fit', 'Account looks fake', 'Incomplete profile'];
      const reasonSelect = `<select data-reason-for="${esc(row.id)}" aria-label="Rejection reason">${reasons.map(r => `<option>${esc(r)}</option>`).join('')}</select>`;
      return `<tr><td>${esc(row.full_name)}</td><td>${igLink(row.ig_handle)}</td><td>${esc(row.phone)}</td><td>${date(row.created_at)}</td><td class="actions"><div><button data-member="${esc(row.id)}" data-decision="approve">Approve</button>${reasonSelect}<button class="secondary" data-member="${esc(row.id)}" data-decision="reject">Reject</button></div></td></tr>`;
    }).join(''), 5);

    const applied = {};
    (stats.data || []).forEach(row => applied[row.event_id] = row.applied);
    $('#events').innerHTML = empty(events.data.map(row => {
      const close = row.status === 'locked' ? `<button data-event="${esc(row.id)}" data-op="close">Close</button>` : '';
      const cancel = ['draft', 'published', 'locked'].includes(row.status) ? `<button class="secondary" data-event="${esc(row.id)}" data-op="cancel">Cancel</button>` : '';
      return `<tr><td>${esc(row.title)}</td><td>${esc(row.venues?.name)}</td><td>${esc(row.status)}</td><td>${date(row.starts_at)}</td><td>${esc(row.seats ?? '—')}</td><td>${esc(applied[row.id] ?? '—')}</td><td class="actions"><div>${close}${cancel}</div></td></tr>`;
    }).join(''), 7);

    $('#invites').innerHTML = empty(invites.data.map(row => {
      const user = names[row.used_by];
      const redeemer = !row.used_by ? '—'
        : user ? `${esc(user.full_name) || '—'}${user.ig_handle ? ` (@${esc(user.ig_handle.replace(/^@/, ''))})` : ''}`
        : esc(row.used_by);
      const copy = row.used_by ? '' : `<button class="secondary" data-copy="${esc(row.code)}">Copy</button>`;
      return `<tr><td>${esc(row.code)}</td><td>${redeemer}</td><td>${date(row.used_at)}</td><td class="actions"><div>${copy}</div></td></tr>`;
    }).join(''), 4);

    $('#venues').innerHTML = empty(venues.data.map(row => {
      const owner = names[row.owner_id];
      return `<tr><td>${esc(row.name)}</td><td>${esc(row.area)}</td><td>${esc(row.kind) || '—'}</td><td>${igLink(row.ig_handle)}</td><td>${esc(owner?.full_name || row.owner_id) || '—'}</td></tr>`;
    }).join(''), 5);

    $('#stories').innerHTML = empty(stories.data.map(row => {
      const application = row.applications || {}, member = application.profiles || {}, event = application.events || {};
      const media = /^https?:\/\//i.test(row.media_url || '') ? `<a class="ig" href="${esc(row.media_url)}" target="_blank" rel="noopener">View story</a>` : '—';
      const actions = row.media_url && row.verdict === 'pending'
        ? `<button data-story="${esc(row.id)}" data-verdict="verified">Verify</button><button class="secondary" data-story="${esc(row.id)}" data-verdict="rejected">Reject</button>`
        : '';
      return `<tr><td>${esc(member.full_name || member.ig_handle || application.member_id)}</td><td>${esc(event.title)}</td><td>${esc(row.verdict)}</td><td>${esc(row.score ?? '—')}</td><td>${media}</td><td>${date(row.due_at)}</td><td class="actions"><div>${actions}</div></td></tr>`;
    }).join(''), 7);

    $('#bookings').innerHTML = empty(bookings.data.map(row => {
      const options = ['pending', 'invoiced', 'paid'].map(status => `<option value="${status}"${status === row.invoice_status ? ' selected' : ''}>${status}</option>`).join('');
      return `<tr><td>${esc(row.events?.title)}</td><td>${money(row.bundle_price)}</td><td>${money(row.cut_amount)}</td><td><select data-booking="${esc(row.id)}" aria-label="Invoice status">${options}</select></td></tr>`;
    }).join(''), 4);

    $('#notifications').innerHTML = empty(notifications.data.map(row => {
      const recipient = names[row.user_id];
      return `<tr><td>${esc(row.kind)}</td><td>${esc(recipient?.full_name || row.user_id)}</td><td>${esc(row.title)}</td><td>${date(row.created_at)}</td></tr>`;
    }).join(''), 4);

    await loadMembers();
    message('Up to date');
  } finally {
    refreshing = false;
  }
}

async function signOut() {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  await supabaseClient.auth.signOut();
  $('#ops').hidden = true;
  $('#founders-only').hidden = true;
  $('#topbar-actions').hidden = true;
  $('#auth').hidden = false;
  message('');
}

async function enter(user) {
  if (!user) return;
  const { data, error } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
  if (error) throw error;
  $('#auth').hidden = true;
  if (data.role !== 'founder') {
    $('#founders-only').hidden = false;
    message('');
    return;
  }
  $('#ops').hidden = false;
  $('#topbar-actions').hidden = false;
  if (!refreshTimer) refreshTimer = setInterval(() => refresh().catch(error => message(error.message, true)), 60000);
  await refresh();
}

$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: $('#email').value.trim(),
      password: $('#password').value,
    });
    if (error) throw error;
    await enter(data.user);
  } catch (error) { message(error.message, true); }
});

$('#venue-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!$('#owner-id').value) { message('Pick an owner from the results list', true); return; }
  try {
    await rpc('create_venue', { p_owner: $('#owner-id').value, p_name: $('#venue-name').value.trim(), p_area: $('#area').value.trim() }, event.target.closest('section'));
    event.target.reset();
    $('#owner-id').value = '';
  } catch (error) { message(error.message, true); }
});

let ownerTimer = null;
let ownerMap = {};
$('#owner-search').addEventListener('input', () => {
  $('#owner-id').value = ownerMap[$('#owner-search').value] || '';
  clearTimeout(ownerTimer);
  ownerTimer = setTimeout(async () => {
    const q = $('#owner-search').value.trim().replace(/[,()]/g, '');
    if (q.length < 2) return;
    try {
      const { data, error } = await supabaseClient.from('profiles')
        .select('id,full_name,ig_handle')
        .or(`full_name.ilike.%${q}%,ig_handle.ilike.%${q}%`)
        .limit(8);
      if (error) throw error;
      ownerMap = {};
      $('#owner-options').innerHTML = data.map(row => {
        const label = `${row.full_name || 'Unnamed'}${row.ig_handle ? ` @${row.ig_handle.replace(/^@/, '')}` : ''} · ${row.id.slice(0, 8)}`;
        ownerMap[label] = row.id;
        return `<option value="${esc(label)}"></option>`;
      }).join('');
      $('#owner-id').value = ownerMap[$('#owner-search').value] || '';
    } catch (error) { message(error.message, true); }
  }, 250);
});

let memberTimer = null;
$('#member-search').addEventListener('input', () => {
  clearTimeout(memberTimer);
  memberTimer = setTimeout(() => loadMembers().catch(error => message(error.message, true)), 300);
});
$('#member-status').addEventListener('change', () => loadMembers().catch(error => message(error.message, true)));

document.addEventListener('change', async event => {
  const select = event.target.closest('select[data-booking]');
  if (!select) return;
  try {
    await rpc('set_invoice_status', { p_booking: select.dataset.booking, p_status: select.value }, select.closest('section'));
  } catch (error) { message(error.message, true); }
});

document.addEventListener('click', async event => {
  if (event.target.closest('button[data-signout]')) {
    try { await signOut(); } catch (error) { message(error.message, true); }
    return;
  }
  const button = event.target.closest('button[data-rpc], button[data-member], button[data-story], button[data-event], button[data-copy], button[data-pause]');
  if (!button) return;
  const scope = button.closest('section') || undefined;
  try {
    if (button.dataset.copy) {
      await navigator.clipboard.writeText(button.dataset.copy);
      message(`Copied ${button.dataset.copy}`);
      return;
    }
    if (button.dataset.rpc === 'refresh') { await refresh(); return; }
    if (button.dataset.rpc === 'history') {
      storiesHistory = !storiesHistory;
      button.textContent = storiesHistory ? 'Hide history' : 'Show history';
      await refresh();
      return;
    }
    if (button.dataset.rpc === 'generate') await rpc('create_invite_codes', { p_count: 10 }, scope);
    if (button.dataset.rpc === 'promote') await rpc('founder_promote_waitlists', {}, scope);
    if (button.dataset.rpc === 'tick') await rpc('founder_run_tick', {}, scope);
    if (button.dataset.pause) {
      const reason = prompt('Reason for pausing this member');
      if (reason === null) return;
      await rpc('suspend_member', { p_member: button.dataset.pause, p_reason: reason || null }, scope);
    }
    if (button.dataset.member) {
      if (button.dataset.decision === 'approve') {
        await rpc('approve_member', { p_member: button.dataset.member }, scope);
      } else {
        const reason = $(`select[data-reason-for="${button.dataset.member}"]`)?.value || null;
        await rpc('reject_member', { p_member: button.dataset.member, p_reason: reason }, scope);
      }
    }
    if (button.dataset.event) {
      if (button.dataset.op === 'cancel') {
        if (!confirm('Cancel this event? Applicants and savers get notified.')) return;
        await rpc('cancel_event', { p_event: button.dataset.event }, scope);
      } else {
        if (!confirm('Close this night? Any confirmed guest not checked in becomes a no-show.')) return;
        await rpc('close_event', { p_event: button.dataset.event }, scope);
      }
    }
    if (button.dataset.story) {
      let reason = '';
      if (button.dataset.verdict === 'rejected') {
        reason = prompt('Reason for rejecting');
        if (reason === null) return;
      }
      await rpc('review_story', { p_story: button.dataset.story, p_verdict: button.dataset.verdict, p_reason: reason }, scope);
    }
  } catch (error) { message(error.message, true); }
});

supabaseClient.auth.getSession().then(({ data }) => enter(data.session?.user)).catch(error => message(error.message, true));
