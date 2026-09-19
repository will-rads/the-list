import React from 'react';
import { createRoot } from 'react-dom/client';
import { supabaseClient } from '../client.js';
const { useState, useEffect, useRef, useMemo } = React;

const DEMO_PREVIEW = new URLSearchParams(window.location.search).get("demo") === "1";
// ?event=<id> deep link — stored through the login flow, opened after hydrate.
const URL_EVENT = new URLSearchParams(window.location.search).get("event");
if (URL_EVENT) { try { sessionStorage.setItem("pending-event", URL_EVENT); } catch (e) {} }

/* ========== curated imagery ========== */
const IMG = {
  beachClub:  "../assets/pool-day.jpg",
  pool:       "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&q=80&auto=format&fit=crop",
  rooftop:    "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=900&q=80&auto=format&fit=crop",
  restaurant: "https://images.unsplash.com/photo-1592861956120-e524fc739696?w=900&q=80&auto=format&fit=crop",
  club:       "https://images.unsplash.com/photo-1545128485-c400e7702796?w=900&q=80&auto=format&fit=crop",
  clubRed:    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=900&q=80&auto=format&fit=crop",
  gym:        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop",
  lounge:     "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
  cocktail:   "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&q=80&auto=format&fit=crop",
  beirut:     "https://images.unsplash.com/photo-1620553967747-50fdadc4b606?w=1200&q=80&auto=format&fit=crop",
  saraFull:   "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80&auto=format&fit=crop",
};

/* Explicit prototype analytics. Only SEED_PROFILE and the mock provider opt in;
   live profiles never inherit these values when their own fields are missing. */
const DEMO_PROFILE_ANALYTICS = {
  follower_growth_30d: 0.043,
  audience_credibility: 0.91,
  periods: {
    "7": {
      average_story_reach: 7900,
      average_reels_views: 19800,
      trend: [
        {label:"Mon", reach:6800, engagement:0.049},
        {label:"Tue", reach:7400, engagement:0.052},
        {label:"Wed", reach:7100, engagement:0.051},
        {label:"Thu", reach:8200, engagement:0.057},
        {label:"Fri", reach:9100, engagement:0.061},
        {label:"Sat", reach:8600, engagement:0.059},
        {label:"Sun", reach:7900, engagement:0.055},
      ],
    },
    "30": {
      average_story_reach: 8600,
      average_reels_views: 21400,
      trend: [
        {label:"1 Jun", reach:7200, engagement:0.051},
        {label:"7 Jun", reach:7800, engagement:0.054},
        {label:"13 Jun", reach:7500, engagement:0.052},
        {label:"19 Jun", reach:9000, engagement:0.060},
        {label:"25 Jun", reach:9400, engagement:0.063},
        {label:"30 Jun", reach:8600, engagement:0.058},
      ],
    },
    "90": {
      average_story_reach: 8300,
      average_reels_views: 20700,
      trend: [
        {label:"Apr", reach:6900, engagement:0.049},
        {label:"Late Apr", reach:7300, engagement:0.051},
        {label:"May", reach:7900, engagement:0.055},
        {label:"Late May", reach:7600, engagement:0.053},
        {label:"Jun", reach:8800, engagement:0.059},
        {label:"Late Jun", reach:9200, engagement:0.062},
      ],
    },
  },
  audience: {
    lebanon_pct: 0.71,
    top_cities: [
      {label:"Beirut", pct:0.39},
      {label:"Jounieh", pct:0.14},
      {label:"Tripoli", pct:0.09},
      {label:"Dubai", pct:0.08},
    ],
    age_groups: [
      {label:"13-17", pct:0.04},
      {label:"18-24", pct:0.41},
      {label:"25-34", pct:0.38},
      {label:"35-44", pct:0.13},
      {label:"45+", pct:0.04},
    ],
    gender: {female:0.62, male:0.38},
    languages: ["Arabic", "English", "French"],
    strongest_active_hours: "8 pm-11 pm",
  },
  content: {
    top_content: [
      {type:"Reel", label:"Pool day", image_url:IMG.pool, views:41800},
      {type:"Story", label:"Beirut rooftop", image_url:IMG.rooftop, views:11200},
      {type:"Post", label:"Dinner edit", image_url:IMG.restaurant, views:18900},
      {type:"Reel", label:"Night out", image_url:IMG.clubRed, views:36700},
    ],
    type_performance: [
      {label:"Stories", score:0.88},
      {label:"Reels", score:0.96},
      {label:"Posts", score:0.64},
    ],
    periods: {
      "7": {averages:{views:19800, likes:1620, comments:76, saves:202, shares:131}, posts_per_week:5.0, sponsored_pct:0.14},
      "30": {averages:{views:21400, likes:1760, comments:84, saves:219, shares:146}, posts_per_week:4.6, sponsored_pct:0.18},
      "90": {averages:{views:20700, likes:1690, comments:81, saves:211, shares:139}, posts_per_week:4.3, sponsored_pct:0.21},
    },
  },
  the_list: {
    reliability_score: 9.4,
    show_up_rate: 0.94,
    story_completion: 0.92,
    average_venue_rating: 4.7,
    events_attended: 18,
    total_verified_reach: 154800,
    no_shows: 1,
    active_strikes: 0,
    last_six: [8.8, 9.1, 9.3, 9.0, 9.5, 9.7],
  },
};

/* ========== Creator data — mock response shape ==========
   Provider TBD (candidates: Phyllo, Modash, Ensembledata). Whichever we
   pick, the backend will normalize to the response shape below so the
   client never has to care. Mocked here so the UX is real even before
   the backend exists.
========================================================== */
function mockCreatorDataFetch(handle){
  // Simulate a 2.4s network call to the creator data provider.
  // Demo: handles "fail" / "notfound" reject so the error + retry path is reachable.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const h = (handle || "capriottisara").replace(/^@/, "").toLowerCase();
      if (h === "fail" || h === "notfound" || h === "error") {
        reject(new Error("handle_not_found"));
        return;
      }
      // Real version: POST /api/creator-data { handle } → backend hits provider
      resolve({
        handle: h,
        platform: "instagram",
        data_status: "estimated",        // becomes "verified" after Connect SDK OAuth
        full_name: "Sara Capriotti",
        profile_picture_url: IMG.saraFull,
        bio: "Beirut · model · creator",
        account_type: "creator",          // personal | creator | business
        followers_count: 28400,
        tiktok_followers: 51200,
        following_count: 712,
        media_count: 184,
        engagement_rate: 0.058,            // 5.8%
        quality_score: 0.91,               // Phyllo's fake-follower check (0-1)
        analytics: DEMO_PROFILE_ANALYTICS,
        demo_profile: true,
        audience: {
          gender_split: { female: 0.62, male: 0.38 },
          age_split: { "13-17": 0.04, "18-24": 0.41, "25-34": 0.38, "35-44": 0.13, "45+": 0.04 },
          country_split: [
            { code: "LB", label: "Lebanon",  pct: 0.71 },
            { code: "AE", label: "UAE",      pct: 0.14 },
            { code: "SA", label: "Saudi",    pct: 0.07 },
            { code: "EU", label: "Other EU", pct: 0.08 },
          ],
        },
        tier_suggestion: 1,                // 1 = Tier 1, etc.
        fetched_at: new Date().toISOString(),
      });
    }, 2400);
  });
}

// Event stages
const STAGE = { draft:"draft", open:"open", locked:"locked", past:"past", cancelled:"cancelled" };
// Guest attendance states (one axis)
const GS = { applied:"applied", waitlist:"waitlist", picked:"picked", confirmed:"confirmed",
  declined:"declined", expired:"expired", withdrawn:"withdrawn", checkedIn:"checked_in",
  noShow:"no_show", notSelected:"not_selected", cancelled:"cancelled" };
// Story states (second axis)
const SS = { due:"due", review:"review", needsReview:"needs_review", rejected:"rejected", missed:"missed", verified:"verified" };
// Member-facing copy. The member NEVER sees the word "Locked".
const STAGE_COPY = { open:"Open", locked:"List closed", past:"Past", cancelled:"Cancelled" };
const GS_COPY = {
  applied:"Applied · under review", waitlist:"Still under review", picked:"Confirm your seat",
  confirmed:"Confirmed", declined:"Declined", expired:"Pick expired", withdrawn:"Withdrawn",
  checked_in:"Checked in", no_show:"No show", not_selected:"Not selected", cancelled:"Event cancelled" };
const SS_COPY = { due:"Story due", review:"Under review", needs_review:"Needs review",
  rejected:"Rejected — try another screenshot", missed:"Missed", verified:"Verified" };

const SEED_EVENTS = [
  // 1. Pool Day — locked, the confirmed-seat demo event
  { id:"pool",    title:"Pool Day",         venue:"Cyan Beach Club",  area:"Jiyeh",
    date:"Sun · 25 May",  time:"14:00", doors:"14:00", img:IMG.beachClub, type:"Beach",
    stage:STAGE.locked, seats:20, applied:137, mix:{girls:15,guys:5},
    closesAt:"Sat · 24 May · 20:00",
    badge:"List closed",
    gallery:[IMG.beachClub, IMG.pool, IMG.cocktail, IMG.beirut],
    brief:{ arrival:"14:00 – 15:00", dress:"Beach chic", meeting:"Host stand — ask for Rami", rules:"1 Story + venue tag during the event" } },

  // 2. Late Lounge — open
  { id:"lounge",  title:"Late Lounge",      venue:"Cyan Beach Club",  area:"Jiyeh",
    date:"Fri · 30 May",  time:"22:00", doors:"22:00", img:IMG.lounge, type:"Lounge",
    stage:STAGE.open, seats:20, applied:137, mix:{girls:15,guys:5},
    closesAt:"Fri · 30 May · 20:00", closingSoon:false,
    badge:"Open",
    gallery:[IMG.lounge, IMG.cocktail, IMG.restaurant],
    brief:{ arrival:"21:30 – 22:30", dress:"Smart dark", meeting:"Door host", rules:"1 Story + venue tag during the event" } },

  // 3. Sound Bath — past
  { id:"bath",    title:"Sound Bath",       venue:"Cyan Beach Club",  area:"Jiyeh",
    date:"Sat · 24 May",  time:"19:00", doors:"19:00", img:IMG.gym, type:"Gym",
    stage:STAGE.past, seats:20, applied:137, mix:{girls:15,guys:5},
    badge:"Past",
    gallery:[IMG.gym, IMG.cocktail] },

  // 4. Vinyl Night — past
  { id:"vinyl",   title:"Vinyl Night",      venue:"Cyan Beach Club",  area:"Jiyeh",
    date:"Sun · 11 May",  time:"21:00", doors:"21:00", img:IMG.lounge, type:"Lounge",
    stage:STAGE.past, seats:12, applied:72, mix:{girls:10,guys:2},
    badge:"Past",
    gallery:[IMG.lounge, IMG.cocktail, IMG.restaurant] },

  // 5. Sunset Tasting — past, different venue
  { id:"tasting", title:"Sunset Tasting",   venue:"Mar Mikhael House",area:"Mar Mikhael",
    date:"Fri · 23 May",  time:"19:30", doors:"19:30", img:IMG.restaurant, type:"Restaurant",
    stage:STAGE.past, seats:12, applied:88,
    badge:"Past",
    gallery:[IMG.restaurant, IMG.lounge, IMG.cocktail] },

  // 6. Harbor Club Night — cancelled
  { id:"harbor",  title:"Harbor Club Night",venue:"Harbor Club",      area:"Dbayeh",
    date:"Thu · 22 May",  time:"22:00", doors:"22:00", img:IMG.club, type:"Club",
    stage:STAGE.cancelled, seats:20, applied:64,
    badge:"Cancelled",
    gallery:[IMG.club, IMG.clubRed] },

  // 7. Sunset Sessions — open, closing-soon badge demo
  { id:"sunset",  title:"Sunset Sessions",  venue:"North Shore",      area:"Batroun",
    date:"Sat · 31 May",  time:"17:00", doors:"17:00", img:IMG.pool, type:"Beach",
    stage:STAGE.open, seats:30, applied:64,
    closesAt:"Sat · 31 May · 12:00", closingSoon:true,
    badge:"Closing soon",
    gallery:[IMG.pool, IMG.rooftop, IMG.beirut, IMG.cocktail],
    brief:{ arrival:"16:30 – 17:30", dress:"Beach casual", meeting:"Main entrance", rules:"1 Story + venue tag during the event" } },

  // 8. Rooftop Cocktails — locked (T11 seed adjustment: was open; now locked for waitlist demo)
  { id:"rooftop", title:"Rooftop Cocktails", venue:"Beirut Terrasse", area:"Achrafieh",
    date:"Sat · 7 Jun",   time:"20:00", doors:"20:00", img:IMG.rooftop, type:"Rooftop",
    stage:STAGE.locked, seats:18, applied:54,
    closesAt:"Sat · 7 Jun · 18:00", closingSoon:false,
    badge:"List closed",
    gallery:[IMG.rooftop, IMG.cocktail, IMG.beirut],
    brief:{ arrival:"20:00 – 21:00", dress:"Smart casual", meeting:"Rooftop elevator", rules:"1 Story + venue tag during the event" } },
];

const eventById = (id, events=SEED_EVENTS) => events.find(e => e.id === id);

const MY_EVENTS = [
  { eventId:"pool",    state:GS.confirmed, code:"LST-4F" },
  { eventId:"lounge",  state:GS.applied },
  { eventId:"bath",    state:GS.checkedIn, story:SS.due },
  { eventId:"vinyl",   state:GS.checkedIn, story:SS.verified,
    verdict:{ score:92, reason:"Tag visible, posted in window" } },
  { eventId:"tasting", state:GS.notSelected },
  { eventId:"harbor",  state:GS.cancelled },
  { eventId:"rooftop", state:GS.waitlist },
];
const SEED_NOTIFS = [
  { id:"n1", kind:"pass",  text:"Tonight · Pool Day — your pass is ready", eventId:"pool", read:false },
  { id:"n2", kind:"story", text:"Sound Bath — your Story is due", eventId:"bath", read:false },
  { id:"n3", kind:"drop",  text:"New room Friday — Late Lounge", eventId:"lounge", read:false },
];

/* Seed profile = the normalized creator-data shape (estimated, pre-verify).
   Used as the Profile fallback when onboarding is skipped, and as the base the
   Verify-with-Instagram flow flips to data_status:"verified". Provider that
   supplies this in production is deliberately not locked (see context.md). */
const SEED_PROFILE = {
  full_name: "Sara Capriotti",
  handle: "capriottisara",
  profile_picture_url: IMG.saraFull,
  followers_count: 28400,
  tiktok_followers: 51200,
  engagement_rate: 0.058,
  data_status: "estimated",
  tier_suggestion: 1,
  analytics: DEMO_PROFILE_ANALYTICS,
  demo_profile: true,
  fetched_at: "2026-07-11T09:30:00.000Z",
  audience: {
    gender_split: { female: 0.62, male: 0.38 },
    country_split: [
      { label: "Lebanon",  pct: 0.71 },
      { label: "UAE",      pct: 0.14 },
      { label: "Saudi",    pct: 0.07 },
      { label: "Other EU", pct: 0.08 },
    ],
  },
};

const APPLICATION_STATE = {
  applied:GS.applied, waitlist:GS.waitlist, picked:GS.picked, confirmed:GS.confirmed,
  declined:GS.declined, expired:GS.expired, not_selected:GS.notSelected,
  checked_in:GS.checkedIn, no_show:GS.noShow, cancelled:GS.cancelled,
};

function normalizeEvent(row){
  const starts = row.starts_at ? new Date(row.starts_at) : null;
  const ends = row.ends_at ? new Date(row.ends_at) : null;
  const closes = row.closes_at ? new Date(row.closes_at) : null;
  const venue = Array.isArray(row.venues) ? row.venues[0] : row.venues;
  const stage = row.status === "cancelled" ? STAGE.cancelled
    : ["completed", "past", "closed"].includes(row.status) ? STAGE.past
    : row.status === "locked" ? STAGE.locked
    : row.status === "draft" ? STAGE.draft : STAGE.open;
  const startsValid = starts && !Number.isNaN(starts.valueOf()) ? starts : null;
  const endsValid = ends && !Number.isNaN(ends.valueOf()) ? ends : null;
  const closesValid = closes && !Number.isNaN(closes.valueOf()) ? closes : null;
  const startTime = startsValid
    ? startsValid.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit", hour12:false})
    : null;
  const kind = row.kind ? String(row.kind) : null;
  return {
    ...row,
    id:row.id,
    title:row.title || row.name || "Untitled room",
    venue:venue?.name || row.venue_name || "The List",
    venueIg:venue?.ig_handle || row.venue_ig || null,
    area:venue?.area || row.area || "Beirut",
    date:startsValid
      ? startsValid.toLocaleDateString("en-GB", {weekday:"short", day:"numeric", month:"short"}).replace(/,/, " ·")
      : "Date TBA",
    time:startTime || row.time || "TBA",
    doors:row.doors || row.doors_at || startTime || row.time || "TBA",
    img:row.image_url || row.cover_url || IMG.lounge,
    type:kind ? kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase() : (row.type || row.category || "Night"),
    stage,
    seats:row.seats || row.capacity || 0,
    applied:row.application_count ?? row.applied ?? 0,
    taken:row.taken ?? null,
    closesAt:closesValid
      ? closesValid.toLocaleString("en-GB", {weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12:false}).replace(/,/, " ·")
      : row.closes_at,
    closesAtDate:closesValid,
    startsAtDate:startsValid,
    endsAtDate:endsValid,
    endsTime:endsValid ? endsValid.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit", hour12:false}) : null,
    storyHours:row.story_window_hours ?? null,
    description:row.description || "",
    gallery:Array.isArray(row.gallery) && row.gallery.length ? row.gallery : [row.image_url || row.cover_url || IMG.lounge],
    brief:row.brief,
  };
}

function notificationKind(kind, title=""){
  if (kind === "picked") return "picked";
  if (["confirm_reminder", "pick_expired"].includes(kind)) return "expiring";
  if (kind === "pass_ready") return "pass";
  if (kind?.startsWith("story_")) return "story";
  if (kind === "event_changed" && /^cancelled/i.test(title)) return "cancelled";
  return "drop";
}

function mapNotification(row){
  return { id:row.id, kind:notificationKind(row.kind, row.title), text:[row.title, row.body].filter(Boolean).join(" · "), eventId:row.event_id, read:row.read };
}

function mapApplication(row, story){
  let storyState;
  let verdict;
  if (story?.verdict === "verified") {
    storyState = SS.verified;
    verdict = { score:story.score, reason:story.breakdown?.reason || story.reason || "Story verified" };
  } else if (story?.verdict === "rejected") {
    storyState = !story.media_url && story.due_at && new Date(story.due_at).getTime() < Date.now() ? SS.missed : SS.rejected;
    verdict = { score:story.score, reason:story.breakdown?.reason || story.reason || "Story did not pass review" };
  } else if (story?.verdict === "needs_review") {
    storyState = SS.needsReview;
    verdict = { score:story.score, reason:story.breakdown?.reason || story.reason || "Our team is taking a second look" };
  } else if (story?.verdict === "pending") {
    // Under review = proof uploaded, verdict pending. Due = nothing uploaded yet.
    storyState = story.media_url ? SS.review : SS.due;
  }
  const rawPickExpiresAt = row.pick_expires_at ? new Date(row.pick_expires_at).getTime() : null;
  const pickExpiresAt = Number.isFinite(rawPickExpiresAt) ? rawPickExpiresAt : undefined;
  const checkedInAt = row.checked_in_at ? new Date(row.checked_in_at) : null;
  return {
    applicationId:row.id,
    eventId:row.event_id,
    state:APPLICATION_STATE[row.status] || row.status,
    code:row.pass_code,
    pickExpiresAt,
    pickedAt:pickExpiresAt ? pickExpiresAt - 24*3600000 : undefined,
    inAt:checkedInAt && !Number.isNaN(checkedInAt.valueOf())
      ? checkedInAt.toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit", hour12:false})
      : undefined,
    storyMediaUrl:story?.media_url || null,
    story:storyState,
    verdict,
  };
}

function localDateKey(value){
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}

function countdownTo(deadline, now=Date.now()){
  if (!deadline) return "--:--:--";
  const time = deadline instanceof Date ? deadline.getTime() : Number(deadline);
  if (!Number.isFinite(time)) return "--:--:--";
  const diff = Math.max(0, time - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
}

function calendarDate(event, end=false){
  const direct = end ? event?.endsAtDate : event?.startsAtDate;
  if (direct instanceof Date && !Number.isNaN(direct.valueOf())) return direct;
  const raw = end ? event?.ends_at : event?.starts_at;
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.valueOf())) return parsed;
  }
  const match = String(event?.date || "").match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (!match) return null;
  const weekday = String(event?.date || "").match(/^([A-Za-z]{3})/)?.[1];
  let year = new Date().getFullYear();
  if (weekday) {
    for (let candidate=year-2; candidate<=year+1; candidate++) {
      const check = new Date(`${match[2]} ${match[1]}, ${candidate} ${event?.time || "12:00"}`);
      if (!Number.isNaN(check.valueOf()) && check.toLocaleDateString("en-GB", {weekday:"short"}) === weekday) { year = candidate; break; }
    }
  }
  const parsed = new Date(`${match[2]} ${match[1]}, ${year} ${event?.time || "12:00"}`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function downloadEventCalendar(event){
  const starts = calendarDate(event);
  if (!starts) return false;
  const ends = calendarDate(event, true) || new Date(starts.getTime() + 3 * 3600000);
  const stamp = date => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const clean = value => String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The List//Member invite//EN", "BEGIN:VEVENT",
    "UID:" + clean(event.id) + "@the-list.app", "DTSTAMP:" + stamp(new Date()),
    "DTSTART:" + stamp(starts), "DTEND:" + stamp(ends), "SUMMARY:" + clean(event.title),
    "LOCATION:" + clean([event.venue, event.area].filter(Boolean).join(", ")),
    "DESCRIPTION:" + clean(event.description || "Your confirmed invitation from The List."),
    "END:VEVENT", "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], {type:"text/calendar;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = String(event.title || "the-list-event").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() + ".ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

/* ========== Intro clips — grainy Beirut nightlife montage ==========
   3 Veo 3.1 clips (5s each), animated from Nano Banana Pro stills:
   Raouche dusk / Batroun coast / Beirut rooftop night. Grainy retro grade
   baked into the stills + reinforced in animation. TSS-style entry montage.
   Posters are the first frame, shown before the video paints.
==================================================================== */
const INTRO_CLIPS = [
  { src:"../assets/intro-1.mp4", poster:"../assets/intro-1.jpg" },
  { src:"../assets/intro-2.mp4", poster:"../assets/intro-2.jpg" },
  { src:"../assets/intro-3.mp4", poster:"../assets/intro-3.jpg" },
];

/* ========== Icon helper (Heroicons, inline) ==========
   Heroicons outline, inlined as SVG so there's no icon CDN dependency at all.
   Closest free stand-in for SF Symbols, which the SwiftUI build will use.
   Call sites keep their lucide-style names; we map to Heroicon glyphs here.
   `stroke` drives stroke-width (Heroicons outline is 1.5 by default).
   instagram has no Heroicon (no brand glyphs) so it's a small custom mark.
====================================================== */
const HICONS = {
  "battery-full": '<path stroke-linecap="round" stroke-linejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15A2.25 2.25 0 0 0 21 15.75v-6a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 1.5 9.75v6A2.25 2.25 0 0 0 3.75 18Z"/>',
  "sparkle": '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>',
  "compass": '<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/>',
  "bookmark": '<path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/>',
  "bookmark-fill": '<path fill="currentColor" stroke="none" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"/>',
  "link": '<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>',
  "paper-plane": '<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>',
  "bell": '<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>',
  "user": '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>',
  "search": '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>',
  "arrow-right": '<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>',
  "arrow-left": '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>',
  "sliders-horizontal": '<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>',
  "x": '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>',
  "share": '<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/>',
  "map-pin": '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>',
  "check": '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>',
  "calendar": '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>',
  "settings": '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>',
  "instagram": '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
  "whatsapp": '<path stroke-linecap="round" stroke-linejoin="round" d="M20.5 11.7a8.3 8.3 0 0 1-12.3 7.2L3 20.5l1.7-5A8.3 8.3 0 1 1 20.5 11.7Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M8.2 7.7c.2-.5.4-.5.8-.5h.4c.2 0 .4 0 .5.4l.8 2c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.4 0 .6.8 1.4 1.9 2.4 3.4 3 .3.1.5.1.7-.1l.9-1.1c.2-.2.4-.3.7-.2l1.9.9c.3.1.5.3.5.5 0 .2-.1 1.3-.8 1.9-.7.7-1.6.8-2.2.8-.6 0-3.8-.8-6.4-3.4-2-2-2.8-4.4-2.8-5.1 0-.7.2-1.3.5-1.7Z"/>',
  "image": '<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z"/>',
};
function Icon({ name, size=18, stroke=1.5, className="" }){
  const inner = HICONS[name] || HICONS["sparkle"];
  return (
    <svg className={"inline-block "+className} width={size} height={size}
         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
         aria-hidden="true" style={{flexShrink:0}}
         dangerouslySetInnerHTML={{__html: inner}}/>
  );
}

/* ========== Countdown — one rule for timers ==========
   #10 — ICE-AS-TEXT vs ICE-AS-FILL:
   • Ice FILL = the one action / affirmative state (primary buttons, chip-ice,
     selected day + filter, the "You're in" ring).
   • Ice TEXT = the one *value* number worth reading (seats left, reputation,
     venue score, this countdown). Ordinals and plain labels are never ice.
   Colons render tighter + dimmed so the tabular digits carry the weight.
====================================================== */
function Countdown({ value, className="", style={} }){
  const parts = String(value).split(":");
  return (
    <span className={"font-mono "+className} style={style}>
      {parts.map((p,i)=>(
        <React.Fragment key={i}>
          {i>0 && <span style={{opacity:.4, margin:"0 .06em"}}>:</span>}
          {p}
        </React.Fragment>
      ))}
    </span>
  );
}

/* ========== Small UI atoms — TSS UX patterns in our skin ==========
   Date-block chips, status pills, a pill-track segmented control, an iOS
   toggle, a save control, a finished section header, and a transient toast.
   Structure borrowed from The Secret Society's app; colour/voice stays
   Carbon + Ice. These replace the thin "label + floating hairline" dividers
   and give every minor control a visible response.
==================================================================== */

// Save / bookmark control. Ice-filled when saved, glass when not.
function SaveButton({ saved, onClick, size=36 }){
  return (
    <button
      onClick={(e)=>{ e.stopPropagation(); onClick(); }}
      aria-label={saved ? "Saved · tap to remove" : "Save event"}
      aria-pressed={saved}
      className={"press hit-44 rounded-full flex items-center justify-center "+(saved ? "" : "glass-over-image")}
      style={{ width:size, height:size, ...(saved ? {background:"var(--ice)", color:"var(--ice-ink)"} : {}) }}>
      <Icon name={saved ? "bookmark-fill" : "bookmark"} size={Math.round(size*0.42)} stroke={1.6}/>
    </button>
  );
}

// iOS-style switch. Ice when on.
function Toggle({ on, onChange }){
  return (
    <button onClick={()=>onChange(!on)} role="switch" aria-checked={on} className="press hit-44 shrink-0"
      style={{ width:46, height:28, borderRadius:999, position:"relative",
        background: on ? "var(--ice)" : "var(--bg-elev2)", border:"1px solid var(--line-2)", transition:"background .2s" }}>
      <span style={{ position:"absolute", top:2, left:2, width:22, height:22, borderRadius:"50%",
        background: on ? "var(--ice-ink)" : "var(--ink)", transform: on ? "translateX(18px)" : "translateX(0)", transition:"transform .2s ease, background .2s" }}/>
    </button>
  );
}

// Rounded status badge. tone: ice (affirmative/open) | neutral (muted) | outline.
// Kit badge style: leading dot + sentence-case label ("• Popular").
function StatusPill({ label, tone="neutral", dot=true }){
  const style = tone==="ice" ? {background:"var(--ice)", color:"var(--ice-ink)"}
    : tone==="outline" ? {border:"1px solid var(--line-2)", color:"var(--ink)"}
    : {background:"var(--bg-elev2)", color:"var(--ink)"};
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium" style={style}>
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{background: tone==="ice" ? "var(--ice-ink)" : "var(--ice)"}}/>}
      {label}
    </span>
  );
}

// "Sun · 25 May" -> { weekday:"Sun", day:"25", month:"May" }
function parseDate(str){
  const [wd, rest] = String(str).split("·").map(s=>s.trim());
  const m = (rest||"").split(" ");
  return { weekday: wd||"", day: m[0]||"", month: m.slice(1).join(" ")||"" };
}
// TSS-style rounded date block. tone: ice | neutral.
function DateChip({ day, sub, tone="neutral" }){
  const style = tone==="ice" ? {background:"var(--ice)", color:"var(--ice-ink)"} : {background:"var(--bg-elev2)", color:"var(--ink)"};
  return (
    <div className="rounded-[12px] flex flex-col items-center justify-center shrink-0" style={{ width:48, height:54, ...style }}>
      <div className="font-black font-mono text-[20px] leading-none">{day}</div>
      <div className="text-[9px] font-medium mt-0.5" style={{opacity:.8}}>{sub}</div>
    </div>
  );
}

// TSS-style widget stat tile: big number top, small label under.
function StatTile({ n, label, ice=false, onClick }){
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={"card rounded-[16px] p-4 text-left "+(onClick?"press":"")}>
      <div className="font-black font-mono text-[26px] leading-none" style={ice?{color:"var(--ice)"}:undefined}>{n}</div>
      <div className="stamp mt-1.5">{label}</div>
    </Tag>
  );
}

// Finished section header — short ice tick + label, optional right meta pill.
// Replaces the old "label + thin trailing hairline" treatment everywhere.
function SectionHead({ label, right, className="" }){
  return (
    <div className={"px-5 flex items-center justify-between "+className}>
      <div className="flex items-center gap-2.5">
        <span className="rounded-full" style={{ width:3, height:15, background:"var(--ice)" }}/>
        <span className="section-label">{label}</span>
      </div>
      {right != null && (
        <span className="text-[10px] font-medium px-2.5 py-1 rounded-full on-photo" style={{border:"1px solid var(--line-2)", color:"var(--ink-mute)"}}>{right}</span>
      )}
    </div>
  );
}

// Pill-track segmented control (TSS toggle pattern). items: [{id,label,count}].
function Segmented({ items, value, onChange }){
  return (
    <div className="flex gap-1 p-1 rounded-full" style={{ background:"var(--bg-elev)", border:"1px solid var(--line)", backdropFilter:"blur(22px) saturate(1.4)", WebkitBackdropFilter:"blur(22px) saturate(1.4)" }}>
      {items.map(it=>{
        const on = it.id===value;
        return (
          <button key={it.id} onClick={()=>onChange(it.id)} className="press flex-1 h-9 rounded-full flex items-center justify-center gap-1 text-[11px] font-medium"
            style={on ? {background:"var(--ink)", color:"var(--bg)"} : {color:"var(--ink-mute)"}}>
            <span>{it.label}</span>
            {it.count != null && <span style={{opacity:.65}}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Transient toast inside the phone frame — gives minor controls a visible reply.
function Toast({ msg }){
  if(!msg) return null;
  return (
    <div className="absolute left-0 right-0 flex justify-center z-[60] pointer-events-none" style={{bottom:"calc(104px + env(safe-area-inset-bottom))"}}>
      <div key={msg} className="anim-up px-4 py-2.5 rounded-full glass-over-image text-[12px] flex items-center gap-2" style={{maxWidth:"82%"}}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:"var(--ice)"}}/>
        <span className="truncate">{msg}</span>
      </div>
    </div>
  );
}

/* ========== Share sheet — what's shared + the actions ========== */
function ShareSheet({ event, onClose, onToast }){
  if(!event) return null;
  const link = "https://the-list-omega.vercel.app/e?id=" + event.id;
  const actions = [
    { id:"copy",  label:"Copy link",       icon:"link",        toast:"Link copied" },
    { id:"dm",    label:"WhatsApp",        icon:"whatsapp",    toast:"Opening WhatsApp" },
    { id:"more",  label:"More",            icon:"share",       toast:"Link copied" },
  ];
  const act = async (action) => {
    if (action.id === "copy") await navigator.clipboard.writeText(link);
    if (action.id === "dm") window.open("https://wa.me/?text=" + encodeURIComponent(link), "_blank", "noopener,noreferrer");
    if (action.id === "more") {
      if (navigator.share) {
        try { await navigator.share({ title:event.title, url:link }); } catch (e) {}
        onClose();
        return;
      }
      await navigator.clipboard.writeText(link);
    }
    onToast(action.toast);
    onClose();
  };
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
      <div className="absolute left-0 right-0 bottom-0 z-50 sheet rounded-t-[24px] px-5 pt-4 pb-7" style={{borderTop:"1px solid var(--line-2)"}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink-mute)", opacity:.4}}/>
        <div className="flex items-center justify-between mb-5">
          <div className="font-black text-[22px] leading-none">Share</div>
          <button onClick={onClose} aria-label="Close" className="press hit-44 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-elev)"}}>
            <Icon name="x" size={14} stroke={1.5}/>
          </button>
        </div>

        {/* Preview of what is being shared */}
        <div className="card flex items-center gap-3 p-3 rounded-[14px] mb-5">
          <img src={event.img} className="w-14 h-16 rounded-[6px] object-cover" alt=""/>
          <div className="flex-1 min-w-0">
            <div className="stamp">{event.type}</div>
            <div className="font-display text-[17px] mt-0.5 truncate">{event.title}</div>
            <div className="text-[11px]" style={{color:"var(--ink-mute)"}}>{event.venue} · {event.date}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {actions.map(a=>(
            <button key={a.id} onClick={()=>act(a)} className="press flex flex-col items-center gap-2 py-3 rounded-[14px]" style={{background:"var(--bg-elev)", border:"1px solid var(--line)"}}>
              <Icon name={a.icon} size={20} stroke={1.5}/>
              <span className="text-[10px]" style={{color:"var(--ink)"}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ========== Settings sheet — profile fields + notifications + account ========== */
/* ========== Demo switchboard (T16) ==========
   Hidden panel at the bottom of Settings — drives the simulated world for
   pitches without waiting on timers. Deliberately plain: this is rig, not
   product UI. Venue side has its own equivalent (venue.html). ========== */
function DemoPanel({ demo }){
  const [open, setOpen] = useState(false);
  const Row = ({ label, onTap }) => (
    <button onClick={onTap} className="press w-full text-left py-2.5 text-[12px]" style={{color:"var(--ink-2)", borderTop:"1px solid var(--line)"}}>{label}</button>
  );
  return (
    <div className="mt-5">
      <button onClick={()=>setOpen(o=>!o)} className="press w-full flex items-center justify-between py-2 text-[11px]" style={{color:"var(--ink-mute)"}}>
        <span>Demo</span>
        <Icon name="arrow-right" size={12} stroke={1.5} className={open ? "rotate-90" : ""}/>
      </button>
      {open && (
        <div>
          <Row label="Venue picks you now" onTap={()=>demo.pickNow()}/>
          <Row label="Expire a pick" onTap={()=>demo.expirePick()}/>
          <Row label="Check me in" onTap={()=>demo.checkIn()}/>
          <div className="py-2.5" style={{borderTop:"1px solid var(--line)"}}>
            <div className="text-[12px] mb-2" style={{color:"var(--ink-2)"}}>Story verdict</div>
            <div className="flex gap-2">
              <button onClick={()=>demo.verdict(SS.verified)} className="press px-3 h-11 rounded-full text-[11px]" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Verified</button>
              <button onClick={()=>demo.verdict(SS.needsReview)} className="press px-3 h-11 rounded-full text-[11px]" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Needs review</button>
              <button onClick={()=>demo.verdict(SS.rejected)} className="press px-3 h-11 rounded-full text-[11px]" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Rejected</button>
            </div>
          </div>
          <Row label="Reset demo" onTap={()=>demo.reset()}/>
        </div>
      )}
    </div>
  );
}

/* ========== Story upload sheet (T14) ==========
   The exchange, honored: 1 Story + venue tag. Screenshot in, simulated
   AI first-pass verdict out (production: Supabase Storage + Edge Function
   + Gemini rubric — see spec §4; founders always able to override). ========== */
function StorySheet({ event, onClose, onSubmit }){
  const [shot, setShot] = useState(null); // dataURL preview
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  if (!event) return null;
  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setShot(reader.result);
    reader.readAsDataURL(f);
  };
  const submit = async () => {
    if (!shot || busy) return;
    setBusy(true);
    try { await onSubmit(shot); } finally { setBusy(false); }
  };
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
      <div className="absolute left-0 right-0 bottom-0 z-50 sheet noscroll overflow-y-auto rounded-t-[24px] px-5 pt-4 pb-7" style={{borderTop:"1px solid var(--line-2)", maxHeight:"88%"}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink-mute)", opacity:.4}}/>
        <div className="flex items-center justify-between mb-2">
          <div className="font-black text-[22px] leading-none">Your Story</div>
          <button onClick={onClose} aria-label="Close" className="press hit-44 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-elev)"}}>
            <Icon name="x" size={14} stroke={1.5}/>
          </button>
        </div>
        <div className="text-[12px] mb-5" style={{color:"var(--ink-mute)"}}>{event.title} · {event.venue}</div>

        <div className="card rounded-[14px] px-4 py-3.5 mb-5 flex items-start gap-3">
          <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{border:"1px solid var(--line-2)"}}>
            <Icon name="instagram" size={14} stroke={1.5}/>
          </span>
          <div className="text-[12px]" style={{color:"var(--ink-2)"}}>The exchange: <span style={{color:"var(--ink)"}}>1 Story + venue tag</span>, posted during the event. Upload a screenshot of it here.</div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" aria-label="Pick your Story screenshot"/>
        {shot ? (
          <button onClick={()=>fileRef.current && fileRef.current.click()} className="press w-full rounded-[14px] overflow-hidden mb-5" style={{border:"1px solid var(--line-2)"}}>
            <img src={shot} className="w-full max-h-[300px] object-cover" alt="Story screenshot preview"/>
            <div className="text-[11px] py-2" style={{color:"var(--ink-mute)"}}>Tap to swap the screenshot</div>
          </button>
        ) : (
          <button onClick={()=>fileRef.current && fileRef.current.click()} className="press w-full h-[160px] rounded-[14px] mb-5 flex flex-col items-center justify-center gap-2" style={{border:"1px dashed var(--line-2)", color:"var(--ink-mute)"}}>
            <Icon name="image" size={22} stroke={1.4}/>
            <span className="text-[12px]">Pick the screenshot</span>
          </button>
        )}

        <button onClick={submit} disabled={!shot || busy}
                className="press glow-primary w-full h-12 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2"
                style={shot ? {background:"var(--ice)", color:"var(--ice-ink)"} : {background:"var(--bg-elev2)", color:"var(--ink-mute)"}}>
          {busy ? (<>
            <span>Uploading</span>
            <span className="spin inline-block w-4 h-4 rounded-full" style={{border:"2px solid currentColor", borderTopColor:"transparent"}}/>
          </>) : (<>
            Submit <Icon name="arrow-right" size={14} stroke={1.6}/>
          </>)}
        </button>
        <div className="text-[11px] text-center mt-3" style={{color:"var(--ink-mute)"}}>Under review · we check within a few hours</div>
      </div>
    </>
  );
}

function SettingsSheet({ profile, light, setLight, onClose, onToast, demo, live, onSave, onLogout, onDelete }){
  const seed = profile || (!live ? SEED_PROFILE : {});
  const [name, setName] = useState(seed.full_name || "");
  const [handle, setHandle] = useState(seed.handle || seed.ig_handle || "");
  const [phone, setPhone] = useState(live ? (seed.phone || "") : "+961 71 000 000");
  const [notifPicks, setNotifPicks] = useState(live ? seed.notif_picks !== false : true);
  const [notifDrops, setNotifDrops] = useState(live ? seed.notif_drops !== false : true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const verified = seed.data_status === "verified";

  const save = async () => {
    if (!live) { onToast("Settings saved"); onClose(); return; }
    if (saving) return;
    setSaving(true);
    const ok = await onSave({
      name:name.trim(),
      handle:handle.trim().replace(/^@/, ""),
      phone:phone.trim(),
      notifPicks,
      notifDrops,
    });
    setSaving(false);
    if (ok !== false) onClose();
  };

  const removeAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    const ok = await onDelete();
    if (ok === false) setDeleting(false);
  };

  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
      <div className="absolute left-0 right-0 bottom-0 z-50 sheet noscroll overflow-y-auto rounded-t-[24px] px-5 pt-4 pb-7" style={{borderTop:"1px solid var(--line-2)", maxHeight:"88%"}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink-mute)", opacity:.4}}/>
        <div className="flex items-center justify-between mb-5">
          <div className="font-black text-[22px] leading-none">Settings</div>
          <button onClick={onClose} aria-label="Close" className="press hit-44 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-elev)"}}>
            <Icon name="x" size={14} stroke={1.5}/>
          </button>
        </div>

        <div className="stamp mb-2">Display name</div>
        <input value={name} onChange={e=>setName(e.target.value)} aria-label="Display name" className="w-full h-12 px-3 rounded-[12px] text-[16px] mb-4" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}/>

        <div className="stamp mb-2">Instagram handle</div>
        <div className="flex h-12 rounded-[12px] overflow-hidden mb-4 items-center" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)"}}>
          <div className="px-3 flex items-center text-[16px]" style={{color:"var(--ink-mute)"}}>@</div>
          <input value={handle} onChange={e=>setHandle(e.target.value)} aria-label="Instagram handle" className="flex-1 bg-transparent text-[16px] focus:outline-none" style={{color:"var(--ink)"}}/>
          {verified && <span className="pr-2"><StatusPill label="Verified" tone="ice"/></span>}
        </div>

        <div className="stamp mb-2">Phone</div>
        <input value={phone} onChange={e=>setPhone(e.target.value)} aria-label="Phone" className="w-full h-12 px-3 rounded-[12px] text-[16px] mb-5" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}/>

        <div className="stamp mb-2">Notifications</div>
        <div className="card rounded-[14px] px-4 mb-5">
          <div className="flex items-center justify-between py-3.5">
            <div className="pr-3"><div className="text-[14px]">When a venue picks you</div><div className="text-[11px]" style={{color:"var(--ink-mute)"}}>The moment that matters</div></div>
            <Toggle on={notifPicks} onChange={setNotifPicks}/>
          </div>
          <div className="flex items-center justify-between py-3.5" style={{borderTop:"1px solid var(--line)"}}>
            <div className="pr-3"><div className="text-[14px]">New drops in Beirut</div><div className="text-[11px]" style={{color:"var(--ink-mute)"}}>Tonight's rooms as they open</div></div>
            <Toggle on={notifDrops} onChange={setNotifDrops}/>
          </div>
        </div>

        <div className="stamp mb-2">Appearance</div>
        <div className="card rounded-[14px] px-4 mb-5">
          <div className="flex items-center justify-between py-3.5">
            <div className="text-[14px]">Light theme</div>
            <Toggle on={light} onChange={setLight}/>
          </div>
        </div>

        <div className="rounded-[12px] px-3 py-3 mb-5 text-[11px]" style={{background:"var(--bg-elev)", color:"var(--ink-mute)", border:"1px solid var(--line)"}}>
          Your reach and audience data are read from Instagram through a licensed provider. The List never sees your password and never posts on your behalf.
        </div>

        <button onClick={save} disabled={saving} className="press glow-primary w-full h-12 rounded-full text-[13px] font-semibold mb-3 flex items-center justify-center gap-2" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
          {saving ? (<>
            <span>Saving</span>
            <span className="spin inline-block w-4 h-4 rounded-full" style={{border:"2px solid currentColor", borderTopColor:"transparent"}}/>
          </>) : "Save changes"}
        </button>
        <div className="flex gap-2">
          <button onClick={()=>{ live ? onLogout() : onToast("Logged out (prototype)"); }} className="press flex-1 h-11 rounded-full text-[12px]" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Log out</button>
          <button onClick={()=>{
              if (!live) { onToast("Profile deactivated (prototype)"); return; }
              if (confirmDelete) { removeAccount(); return; }
              setConfirmDelete(true);
            }}
            className="press flex-1 h-11 rounded-full text-[12px]"
            style={confirmDelete ? {background:"var(--ink)", color:"var(--bg)"} : {border:"1px solid var(--line-2)", color:"var(--ink-mute)"}}>
            {deleting ? "Deactivating" : confirmDelete ? "Tap again to deactivate" : "Deactivate profile"}
          </button>
        </div>
        {confirmDelete && (
          <div className="text-[11px] text-center mt-3" style={{color:"var(--ink)"}}>This anonymizes your profile, cancels open applications, and signs you out. Contact support for full data deletion.</div>
        )}

        {demo && <DemoPanel demo={demo}/>}
      </div>
    </>
  );
}

/* ========== Notifications sheet — Activity feed, driven by notifs state ========== */
function NotificationsSheet({ notifs, onClose, onTarget }){
  // Icon per notification kind
  const kindIcon = { pass:"check", story:"instagram", drop:"bell", picked:"sparkle", expiring:"calendar", cancelled:"x" };
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
      <div className="absolute left-0 right-0 bottom-0 z-50 sheet rounded-t-[24px] px-5 pt-4 pb-7" style={{borderTop:"1px solid var(--line-2)"}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink-mute)", opacity:.4}}/>
        <div className="flex items-center justify-between mb-5">
          <div className="font-black text-[22px] leading-none">Activity</div>
          <button onClick={onClose} aria-label="Close" className="press hit-44 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-elev)"}}>
            <Icon name="x" size={14} stroke={1.5}/>
          </button>
        </div>

        {notifs.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{border:"1px solid var(--line-2)"}}>
              <Icon name="bell" size={18} stroke={1.4}/>
            </div>
            <div className="section-label mt-4">No activity yet</div>
            <div className="text-[13px] mt-2" style={{color:"var(--ink)"}}>Picks, passes and story updates land here.</div>
          </div>
        )}
        <div className="space-y-2">
          {notifs.map(n => {
            const icon = kindIcon[n.kind] || "bell";
            const isRead = n.read;
            const handleTap = () => onTarget(n); // every row deep-links (routing lives in App.notifTarget)
            return (
              <button key={n.id}
                onClick={handleTap}
                className="press card w-full text-left rounded-[14px] p-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{border:"1px solid var(--line-2)", opacity: isRead ? 0.55 : 1}}>
                  {n.kind === "pass"
                    ? <span className="w-2 h-2 rounded-full" style={{background:"var(--ice)"}}/>
                    : <Icon name={icon} size={14} stroke={1.5}/>}
                </span>
                <span className="flex-1 min-w-0 text-[13px]" style={{color:"var(--ink)", opacity: isRead ? 0.65 : 1}}>{n.text}</span>
                {!isRead && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:"var(--ice)"}}/>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ========== Screen content and anchored tab bar ========== */
function PhoneScreen({ children, tab, onTab }){
  return (
    <div className="absolute inset-0 anim-fade" style={{background:"transparent"}}>
      <div className="absolute inset-0 noscroll overflow-y-auto" style={{paddingBottom: tab ? "calc(88px + env(safe-area-inset-bottom))" : "env(safe-area-inset-bottom)"}}>
        {children}
      </div>
      {tab && <TabBar active={tab} onChange={onTab}/>}
    </div>
  );
}

/* ========== tab bar ========== */
function TabBar({ active, onChange }){
  const items = [
    { id:"home",    label:"Home",    icon:"sparkle" },
    { id:"explore", label:"Explore", icon:"compass" },
    { id:"mylist",  label:"Invites", icon:"bookmark" },
    { id:"profile", label:"Profile", icon:"user"   },
  ];
  return (
    <nav className="tabbar" aria-label="Main navigation">
      {items.map(it=>(
        <button key={it.id} onClick={()=>onChange(it.id)} aria-current={active===it.id ? "page" : undefined} className={"press "+(active===it.id?"active":"")}>
          <Icon name={it.icon} size={18} stroke={1.4}/>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ========== stage badge helper — single source of truth for browse surfaces ========== */
function stageBadge(event){
  if (event.stage === STAGE.open) return event.closingSoon ? "Closing soon" : STAGE_COPY.open;
  if (event.stage === STAGE.locked) return STAGE_COPY.locked;
  if (event.stage === STAGE.past) return STAGE_COPY.past;
  if (event.stage === STAGE.cancelled) return STAGE_COPY.cancelled;
  return "";
}

/* ========== 01 — HOME ========== */
function ScreenHome({ tab, onTab, onPickEvent, saved, onToggleSave, myEvents, onBell, unreadCount, onOpenPass, events, live }){
  const activeRow = [GS.confirmed, GS.picked, GS.checkedIn, GS.applied, GS.waitlist]
    .map(s => (myEvents || []).find(r => r.state === s)).find(Boolean);
  const activeEvent = activeRow ? events.find(e => e.id === activeRow.eventId) : null;
  const browseEvents = events.filter(e => e.stage === STAGE.open || e.stage === STAGE.locked);
  // Live + no rooms → real empty state, never the seed world.
  if (live && !activeEvent && browseEvents.length === 0) {
    return (
      <PhoneScreen tab={tab} onTab={onTab}>
        <div className="px-5 app-safe-top pb-3">
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onBell} aria-label="Activity" className="press glass w-10 h-10 rounded-full flex items-center justify-center relative">
                <Icon name="bell" size={16} stroke={1.4}/>
                {unreadCount > 0 && <span className="absolute rounded-full flex items-center justify-center font-mono" style={{top:-2, right:-2, width:16, height:16, fontSize:10, background:"var(--ice)", color:"var(--ice-ink)"}}>{unreadCount}</span>}
              </button>
              <button onClick={()=>onTab("explore")} aria-label="Search" className="press glass w-10 h-10 rounded-full flex items-center justify-center">
                <Icon name="search" size={16} stroke={1.4}/>
              </button>
            </div>
          </div>
          <div className="flex items-end justify-between mt-3">
            <div className="font-black font-display-l text-[40px] leading-none">Home</div>
            <div className="font-medium text-[14px] pb-1" style={{color:"var(--ink-2)"}}>{new Date().toLocaleDateString("en-GB",{weekday:"long"})} · {String(new Date().getDate()).padStart(2,"0")}.{String(new Date().getMonth()+1).padStart(2,"0")}</div>
          </div>
        </div>
        <div className="hr-2 mx-5 mb-5"/>
        <div className="px-5 py-20 text-center">
          <div className="section-label">No rooms open yet</div>
          <div className="text-[13px] mt-2 on-photo" style={{color:"var(--ink)"}}>New drops land here the moment a venue opens one.</div>
        </div>
      </PhoneScreen>
    );
  }
  const featured = browseEvents.find(e => e.id === "pool") || browseEvents[0] || activeEvent || SEED_EVENTS[0];
  // Pinned next room — the member's most advanced active application, else next open room
  const confirmedRow = activeRow?.state === GS.confirmed ? activeRow : null;
  const confirmedEvent = confirmedRow ? activeEvent : null;
  const nextEvent = activeEvent || browseEvents.find(e => e.id === "lounge") || browseEvents.find(e => e.stage === STAGE.open) || featured;
  // Tonight: open events only (no cancelled, no past), minus whatever is already featured or pinned
  const tonight  = browseEvents.filter(e => e.stage === STAGE.open && e.id !== featured.id && e.id !== nextEvent.id);
  const nextDate  = parseDate(nextEvent.date);
  return (
    <PhoneScreen tab={tab} onTab={onTab}>
      {/* v3 ruling (2026-07-04): no identity strip on Home — icons only,
          screen opens with content. One-word masthead below. */}
      <div className="px-5 app-safe-top pb-3">
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onBell} aria-label="Activity" className="press glass w-10 h-10 rounded-full flex items-center justify-center relative">
              <Icon name="bell" size={16} stroke={1.4}/>
              {unreadCount > 0 && <span className="absolute rounded-full flex items-center justify-center font-mono" style={{top:-2, right:-2, width:16, height:16, fontSize:10, background:"var(--ice)", color:"var(--ice-ink)"}}>{unreadCount}</span>}
            </button>
            <button onClick={()=>onTab("explore")} aria-label="Search" className="press glass w-10 h-10 rounded-full flex items-center justify-center">
              <Icon name="search" size={16} stroke={1.4}/>
            </button>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div className="font-black font-display-l text-[40px] leading-none">Home</div>
          <div className="font-medium text-[14px] pb-1" style={{color:"var(--ink-2)"}}>{new Date().toLocaleDateString("en-GB",{weekday:"long"})} · {String(new Date().getDate()).padStart(2,"0")}.{String(new Date().getMonth()+1).padStart(2,"0")}</div>
        </div>
      </div>

      <div className="hr-2 mx-5 mb-5"/>

      {/* Pinned — your next room, one calm row. Tap lands on Invites. */}
      <SectionHead label="Your night" className="pb-3"/>
      <div className="px-5 pb-5">
        <button onClick={()=> confirmedEvent ? onOpenPass(confirmedEvent.id) : onTab("mylist")} className="press card w-full text-left rounded-[14px] p-3 flex items-center gap-3">
          <DateChip day={nextDate.day} sub={nextDate.month} tone="ice"/>
          <div className="flex-1 min-w-0">
            <div className="font-display text-[17px] truncate">{nextEvent.title}</div>
            <div className="text-[11px] mt-0.5" style={{color:"var(--ink)"}}>
              {confirmedEvent ? "Doors " + (nextEvent.doors || nextEvent.time) + " · View pass"
                : activeRow ? (GS_COPY[activeRow.state] || "Applied") + " · " + nextEvent.time
                : "Open · " + nextEvent.time}
            </div>
          </div>
          <Icon name="arrow-right" size={16} stroke={1.4} className="opacity-50"/>
        </button>
      </div>

      {/* Featured */}
      <div className="px-5">
        <div className="card w-full text-left rounded-[18px] overflow-hidden relative grain" style={{height:380}}>
          <button onClick={()=>onPickEvent(featured)} aria-label={"Open " + featured.title} className="press absolute inset-0 z-10 rounded-[18px]"/>
          <img src={featured.img} className="absolute inset-0 w-full h-full object-cover" alt=""/>
          <div className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.9) 100%)"}}/>
          <div className="absolute top-3 left-3"><StatusPill label={(() => { const row = (myEvents||[]).find(r=>r.eventId===featured.id); return row ? (GS_COPY[row.state]||stageBadge(featured)) : stageBadge(featured); })()} tone="ice"/></div>
          <div className="absolute top-3 right-3 z-20"><SaveButton saved={saved.includes(featured.id)} onClick={()=>onToggleSave(featured.id)}/></div>
          <div className="absolute bottom-4 left-4 right-4 text-[var(--ink)]" style={{color:"#F7F6F3"}}>
            <div className="font-black font-display-l text-[40px] leading-[0.92]">{featured.title}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[12px]">{featured.venue}</span>
              <span style={{color:"var(--ink)"}}>·</span>
              <span className="text-[12px] font-mono">{featured.date}</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="font-mono text-[18px]" style={{color:"var(--ice)"}}>{featured.seats}</span>
                <span className="text-[11px] ml-1" style={{color:"var(--ink)"}}>seats · {featured.applied} applied</span>
              </div>
              <div className="px-3 py-1.5 rounded-full chip-ice text-[10px] font-medium">Tap to view</div>
            </div>
          </div>
        </div>
      </div>

      {/* Also tonight */}
      <SectionHead label="Also tonight" right={tonight.length + " open"} className="pt-7 pb-3"/>
      <div className="px-5 space-y-3 stagger">
        {tonight.map((e,i)=>(
          <button key={e.id} onClick={()=>onPickEvent(e)} style={{"--i":i}} className="press card w-full flex gap-3 items-center text-left p-3 rounded-[14px]">
            <img src={e.img} className="w-16 h-20 rounded-[6px] object-cover" alt=""/>
            <div className="flex-1 min-w-0">
              <div className="stamp">{e.type}</div>
              <div className="font-display text-[17px] mt-0.5 truncate">{e.title}</div>
              <div className="text-[11px]" style={{color:"var(--ink-mute)"}}>{e.venue} · {e.area}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="font-mono text-[11px]" style={{color:"var(--ice)"}}>{e.seats} seats</span>
                <span style={{color:"var(--ink-mute)"}}>·</span>
                <span className="font-mono text-[11px]" style={{color:"var(--ink-mute)"}}>{e.applied} applied</span>
              </div>
            </div>
            <Icon name="arrow-right" size={16} stroke={1.4} className="opacity-50"/>
          </button>
        ))}
      </div>

      <div className="h-8"/>
    </PhoneScreen>
  );
}

/* ========== Filter sheet (Explore overlay) ========== */
function FilterSheet({ open, onClose, advFilters, setAdvFilters, live }){
  if(!open) return null;
  const verticals = ["Beach","Club","Restaurant","Lounge","Gym","Rooftop"];
  const distances = ["< 5 km","5 - 15 km","15 - 30 km","Beirut + Mount"];
  const timings = ["Tonight","This week","Anytime"];

  const toggleVert = (v) => setAdvFilters({
    ...advFilters,
    verticals: advFilters.verticals.includes(v)
      ? advFilters.verticals.filter(x=>x!==v)
      : [...advFilters.verticals, v]
  });

  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
      <div className="absolute left-0 right-0 bottom-0 z-50 sheet rounded-t-[24px] px-5 pt-4 pb-7" style={{borderTop:"1px solid var(--line-2)"}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink-mute)", opacity:.4}}/>

        <div className="flex items-center justify-between mb-5">
          <div className="font-black text-[22px] leading-none">Filters</div>
          <button onClick={onClose} aria-label="Close" className="press hit-44 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-elev)"}}>
            <Icon name="x" size={14} stroke={1.5}/>
          </button>
        </div>

        <div className="stamp mb-2">Vertical</div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {verticals.map(v=>{
            const on = advFilters.verticals.includes(v);
            return (
              <button key={v} onClick={()=>toggleVert(v)} className={"press px-3 h-11 rounded-full text-[12px] "+(on?"glow-ice":"")} style={on ? {background:"var(--ink)", color:"var(--bg)"} : {border:"1px solid var(--line-2)", color:"var(--ink)"}}>
                {v}
              </button>
            );
          })}
        </div>

        {!live && (<>
          <div className="stamp mb-2">Distance</div>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {distances.map(d=>{
              const on = advFilters.distance === d;
              return (
                <button key={d} onClick={()=>setAdvFilters({...advFilters, distance: on ? null : d})} className={"press px-3 h-11 rounded-full text-[12px] "+(on?"glow-ice":"")} style={on ? {background:"var(--ice)", color:"var(--ice-ink)"} : {border:"1px solid var(--line-2)", color:"var(--ink)"}}>
                  {d}
                </button>
              );
            })}
          </div>
        </>)}

        <div className="stamp mb-2">When</div>
        <div className="flex gap-1.5 mb-6">
          {timings.map(t=>{
            const on = advFilters.timing === t;
            return (
              <button key={t} onClick={()=>setAdvFilters({...advFilters, timing: t})} className={"press flex-1 h-11 rounded-[12px] text-[12px] "+(on?"glow-ice":"")} style={on ? {background:"var(--ink)", color:"var(--bg)"} : {border:"1px solid var(--line-2)", color:"var(--ink)"}}>
                {t}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={()=>setAdvFilters({ verticals:[], distance:null, timing:"Anytime" })} className="press flex-1 h-12 rounded-full text-[12px]" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>
            Reset
          </button>
          <button onClick={onClose} className="press glow-primary flex-[2] h-12 rounded-full text-[13px] font-semibold" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
            Show rooms
          </button>
        </div>
      </div>
    </>
  );
}

/* ========== Calendar sheet (Explore overlay) — full month, May ========== */
function CalendarSheet({ onClose, activeKey, onPick, eventDates, live }){
  const liveDates = (eventDates || []).filter(date => date instanceof Date && !Number.isNaN(date.valueOf()));
  const selected = activeKey ? new Date(activeKey + "T12:00:00") : null;
  const base = live && liveDates.length ? (selected || liveDates[0]) : new Date(new Date().getFullYear(), 4, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const eventKeys = new Set(live
    ? liveDates.filter(date => date.getFullYear() === year && date.getMonth() === month).map(localDateKey)
    : [24,25,30,31].map(day => localDateKey(new Date(year, month, day))));
  const title = new Date(year, month, 1).toLocaleDateString("en-GB", {month:"long", year:live ? "numeric" : undefined});
  return (
    <>
      <div onClick={onClose} className="absolute inset-0 z-40 sheet-backdrop" style={{background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)"}}/>
      <div className="absolute left-0 right-0 bottom-0 z-50 sheet rounded-t-[24px] px-5 pt-4 pb-7" style={{borderTop:"1px solid var(--line-2)"}}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{background:"var(--ink-mute)", opacity:.4}}/>
        <div className="flex items-center justify-between mb-5">
          <div className="font-black text-[22px] leading-none">{title}</div>
          <button onClick={onClose} aria-label="Close" className="press hit-44 w-8 h-8 rounded-full flex items-center justify-center" style={{background:"var(--bg-elev)"}}>
            <Icon name="x" size={14} stroke={1.5}/>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {["M","T","W","T","F","S","S"].map((w,i)=>(
            <div key={i} className="stamp text-center">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 justify-items-center">
          {Array.from({length:blanks}).map((_,i)=>(
            <div key={"b"+i} style={{width:36, height:36}}/>
          ))}
          {Array.from({length:daysInMonth}, (_,i)=>i+1).map(d=>{
            const key = localDateKey(new Date(year, month, d));
            const has = eventKeys.has(key);
            const sel = key === activeKey;
            const Tag = has ? "button" : "div";
            return (
              <Tag key={d} onClick={has ? ()=>onPick(key) : undefined}
                className={"rounded-full flex flex-col items-center justify-center "+(has?"press":"")}
                style={{width:44, height:44, background: sel ? "var(--ice)" : "transparent", color: sel ? "var(--ice-ink)" : "var(--ink)"}}>
                <span className="font-mono text-[13px] leading-none">{d}</span>
                {has && <span className="rounded-full mt-1" style={{width:4, height:4, background: sel ? "var(--ice-ink)" : "var(--ice)"}}/>}
              </Tag>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ========== 02 — EXPLORE ========== */
function ScreenExplore({ tab, onTab, onPickEvent, saved, onToggleSave, onToast, events, live }){
  const [filter, setFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const exploreEvents = events.filter(e => e.stage !== STAGE.cancelled && e.stage !== STAGE.past);
  const liveDates = exploreEvents.map(e => e.startsAtDate).filter(date => date instanceof Date && !Number.isNaN(date.valueOf())).sort((a,b)=>a-b);
  const demoDays = exploreEvents.map(calendarDate).filter(date => date instanceof Date && !Number.isNaN(date.valueOf()));
  if (!demoDays.length) [23,24,25,26,27,28].forEach(day => demoDays.push(new Date(new Date().getFullYear(), 4, day)));
  const eventDates = live ? liveDates : demoDays;
  const dayKeys = [...new Set(eventDates.map(localDateKey).filter(Boolean))];
  const [activeKey, setActiveKey] = useState(dayKeys[0] || null);
  const [advFilters, setAdvFilters] = useState({ verticals:[], distance:null, timing:"Anytime" });
  useEffect(() => {
    if (live && dayKeys.length && !dayKeys.includes(activeKey)) setActiveKey(dayKeys[0]);
  }, [live, dayKeys.join("|"), activeKey]);
  const displayDates = dayKeys.map(key => new Date(key + "T12:00:00"));
  const days = displayDates.slice(0,6).map(date => ({key:localDateKey(date), d:String(date.getDate()).padStart(2,"0"), w:date.toLocaleDateString("en-GB", {weekday:"short"})}));
  const pickDay = (key) => {
    setActiveKey(key);
    setCalOpen(false);
    const date = new Date(key + "T12:00:00");
    if (onToast) onToast("Showing " + date.toLocaleDateString("en-GB", {weekday:"short", day:"numeric", month:"short"}));
  };
  const filters = ["all","beach","club","restaurant","lounge"];
  // Browse shows only open+locked events; cancelled and past are never shown in browse
  const browseable = exploreEvents;
  const todayKey = localDateKey(new Date());
  const weekEnd = Date.now() + 7 * 86400000;
  const eventDayKey = e => localDateKey(e.startsAtDate || calendarDate(e));
  const list = browseable
    .filter(e => !activeKey || eventDayKey(e) === activeKey)
    .filter(e => filter==="all" ? true : String(e.type).toLowerCase()===filter)
    .filter(e => advFilters.verticals.length === 0 || advFilters.verticals.includes(e.type))
    .filter(e => advFilters.timing === "Anytime"
      || (advFilters.timing === "Tonight" && eventDayKey(e) === todayKey)
      || (advFilters.timing === "This week" && (e.startsAtDate || calendarDate(e)) && (e.startsAtDate || calendarDate(e)).getTime() >= Date.now() && (e.startsAtDate || calendarDate(e)).getTime() <= weekEnd))
    .sort((a,b) => (a.closesAtDate?.getTime() || a.startsAtDate?.getTime() || Infinity) - (b.closesAtDate?.getTime() || b.startsAtDate?.getTime() || Infinity));
  const defaultTiming = "Anytime";
  const activeAdvCount = advFilters.verticals.length + (!live && advFilters.distance ? 1 : 0) + (advFilters.timing !== defaultTiming ? 1 : 0);

  return (
    <PhoneScreen tab={tab} onTab={onTab}>
      <div className="px-5 app-safe-top pb-3 flex items-end justify-between">
        <div className="font-black font-display-l text-[40px] leading-none">Explore</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setCalOpen(true)} aria-label="Open calendar" className="press glass w-11 h-11 rounded-full flex items-center justify-center">
            <Icon name="calendar" size={15} stroke={1.5}/>
          </button>
          <button onClick={()=>setSheetOpen(true)} className="press glass flex items-center gap-1.5 px-3 h-11 rounded-full">
            <Icon name="sliders-horizontal" size={13} stroke={1.5}/>
            <span className="text-[11px] font-medium">Filters</span>
            {activeAdvCount > 0 && <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>{activeAdvCount}</span>}
          </button>
        </div>
      </div>
      <FilterSheet open={sheetOpen} onClose={()=>setSheetOpen(false)} advFilters={advFilters} setAdvFilters={setAdvFilters} live={live}/>
      {calOpen && <CalendarSheet onClose={()=>setCalOpen(false)} activeKey={activeKey} onPick={pickDay} eventDates={liveDates} live={live}/>}

      <div className="px-5 pt-4 flex gap-2 overflow-x-auto noscroll">
        {days.map(d=>{
          const on = d.key === activeKey;
          return (
            <button key={d.key} onClick={()=>pickDay(d.key)} className={"press flex-shrink-0 w-[58px] h-[68px] rounded-[12px] flex flex-col items-center justify-center "+(on?"glow-ice":"border")} style={{background: on ? "var(--ice)" : "transparent", borderColor:"var(--line-2)", color: on ? "var(--ice-ink)" : "var(--ink)"}}>
              <div className="font-mono text-[20px] leading-none">{d.d}</div>
              <div className="text-[9px] font-medium mt-1 opacity-75">{d.w}</div>
            </button>
          );
        })}
      </div>

      <div className="px-5 pt-4 flex gap-2 overflow-x-auto noscroll">
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={"press flex-shrink-0 px-3 h-11 rounded-full text-[11px] font-medium "+(filter===f?"glow-ice":"chip-outline")} style={filter===f ? {background:"var(--ink)", color:"var(--bg)"} : {}}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <SectionHead label={list.length + " rooms"} right="Closes soonest" className="pt-6 pb-3"/>

      {list.length === 0 ? (
        <div className="px-5 py-20 text-center">
          <div className="section-label" style={{color:"var(--ink-mute)"}}>No rooms match</div>
          <div className="text-[13px] mt-2 on-photo" style={{color:"var(--ink-mute)"}}>Loosen a filter or widen the date.</div>
        </div>
      ) : (() => {
        const [lead, ...rest] = list;
        return (
          <>
            {/* Lead — first room gets full editorial weight */}
            <div className="px-5">
              <div className="card w-full text-left rounded-[18px] overflow-hidden grain relative" style={{height:300}}>
                <button onClick={()=>onPickEvent(lead)} aria-label={"Open " + lead.title} className="press absolute inset-0 z-10 rounded-[18px]"/>
                <img src={lead.img} className="absolute inset-0 w-full h-full object-cover" alt=""/>
                <div className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,.92) 100%)"}}/>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full glass-over-image" style={{color:"#F7F6F3"}}>{lead.type}</span>
                  {stageBadge(lead) && <StatusPill label={stageBadge(lead)} tone="ice"/>}
                </div>
                <div className="absolute top-3 right-3 z-20"><SaveButton saved={saved.includes(lead.id)} onClick={()=>onToggleSave(lead.id)}/></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between" style={{color:"#F7F6F3"}}>
                  <div className="min-w-0">
                    <div className="font-black font-display-l text-[34px] leading-[0.95]">{lead.title}</div>
                    <div className="text-[12px] mt-1.5 opacity-80 truncate">{lead.venue} · {lead.area}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-mono text-[11px]" style={{color:"var(--ice)"}}>{lead.date.split('·')[0].trim()}</div>
                    <div className="font-mono text-[11px]">{lead.time}</div>
                    <div className="font-mono text-[12px] mt-1"><span style={{color:"var(--ice)"}}>{lead.seats}</span><span> seats</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Index — the rest, denser rows */}
            {rest.length > 0 && (
              <div className="px-5 pt-6 space-y-2 stagger">
                {rest.map((e,i)=>(
                  <button key={e.id} onClick={()=>onPickEvent(e)} style={{"--i":i}} className="press card w-full flex gap-3 items-center text-left p-2.5 rounded-[14px]">
                    <img src={e.img} className="w-14 h-16 rounded-[6px] object-cover shrink-0" alt=""/>
                    <div className="flex-1 min-w-0">
                      <div className="stamp">{e.type}</div>
                      <div className="font-display text-[17px] mt-0.5 truncate">{e.title}</div>
                      <div className="text-[11px] truncate" style={{color:"var(--ink-mute)"}}>{e.venue} · {e.area}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-[12px]"><span style={{color:"var(--ice)"}}>{e.seats}</span><span style={{color:"var(--ink-mute)"}}> seats</span></div>
                      <div className="font-mono text-[11px] mt-0.5" style={{color:"var(--ink-mute)"}}>{e.time}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        );
      })()}

      <div className="h-8"/>
    </PhoneScreen>
  );
}

/* ========== 03 — EVENT DETAIL ========== */
function ScreenEventDetail({ event, onBack, onApply, onCancel, applyState, onShare, saved, onToggleSave, onToast, myEvents, onOpenPicked, onOpenPass, live }){
  const [heroIdx, setHeroIdx] = useState(0);
  const [clockNow, setClockNow] = useState(Date.now());
  const heroRaf = useRef(null);
  const e = event || (!live ? SEED_EVENTS[0] : null);
  const deadline = e?.closesAtDate || e?.startsAtDate || null;
  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline?.getTime?.()]);
  useEffect(() => () => { if (heroRaf.current) cancelAnimationFrame(heroRaf.current); }, []);
  if (!e) return (
    <div className="absolute inset-0 screen-ground flex flex-col items-center justify-center px-8 text-center">
      <div className="section-label">Room unavailable</div>
      <div className="text-[13px] mt-2">This room could not be loaded.</div>
      <button onClick={onBack} className="press h-12 px-5 rounded-full mt-6" style={{border:"1px solid var(--line-2)"}}>Go back</button>
    </div>
  );
  const gallery = e.gallery || [e.img];
  // Derive member's relationship to this event
  const myRow = (myEvents||[]).find(r => r.eventId === e.id);
  const seatsLeft = Number.isFinite(Number(e.taken)) ? Math.max(0, Number(e.seats || 0) - Number(e.taken)) : Number(e.seats || 0);
  const storyWindow = live
    ? (e.storyHours ? "Post within " + e.storyHours + " hours of doors" : [e.time, e.endsTime].filter(Boolean).join(" - "))
    : "Posted between 14:00 - 21:00";
  const venueTag = e.venueIg ? "@" + String(e.venueIg).replace(/^@/, "") : e.venue;
  const description = e.description || (!live ? "Resident DJ Karim Sahli from 16:00. Mediterranean menu at sunset. Dress: swimwear and an attitude." : "");
  const openMaps = () => window.open("https://maps.google.com/?q=" + encodeURIComponent([e.venue, e.area].filter(Boolean).join(", ")), "_blank", "noopener,noreferrer");
  return (
    <div className="absolute inset-0 anim-fade screen-ground">
      <div className="absolute inset-0 noscroll overflow-y-auto" style={{paddingBottom:"calc(120px + env(safe-area-inset-bottom))"}}>

      {/* Hero */}
      <div className="relative h-[480px]">
        <div className="flex overflow-x-auto snap-x snap-mandatory noscroll h-full" style={{scrollSnapType:"x mandatory"}}
             onScroll={(ev)=>{
               const target = ev.currentTarget;
               if (heroRaf.current) return;
               heroRaf.current = requestAnimationFrame(() => {
                 heroRaf.current = null;
                 const w = target.clientWidth;
                 if (w) setHeroIdx(Math.round(target.scrollLeft/w));
               });
             }}>
          {gallery.map((src,i)=>(
            <img key={i} src={src} alt="" className="w-full shrink-0 object-cover" style={{height:"480px", scrollSnapAlign:"center", minWidth:"100%"}}/>
          ))}
        </div>
        <div className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,.95) 100%)", pointerEvents:"none"}}/>
        <div className="absolute inset-0 grain" style={{pointerEvents:"none"}}/>

        <div className="absolute app-top-controls left-5 right-5 flex items-center justify-between z-10">
          <button onClick={onBack} aria-label="Back" className="press glass-over-image w-10 h-10 rounded-full flex items-center justify-center">
            <Icon name="arrow-left" size={18} stroke={1.4}/>
          </button>
          <div className="flex gap-2">
            <SaveButton size={40} saved={saved.includes(e.id)} onClick={()=>onToggleSave(e.id)}/>
            <button onClick={onShare} aria-label="Share" className="press glass-over-image w-10 h-10 rounded-full flex items-center justify-center">
              <Icon name="share" size={16} stroke={1.4}/>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-5 right-5 pb-6 z-10" style={{color:"#F7F6F3"}}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium px-2 py-1 rounded-full chip-ice">{e.type}</span>
            <span className="text-[10px] font-medium">{e.venue}</span>
          </div>
          <div className="font-black font-display-l text-[52px] leading-[0.92]">{e.title}</div>
          {description && <div className="text-[12px] mt-3 max-w-[280px] opacity-80">{description}</div>}
          {gallery.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {gallery.map((_,i)=>(
                <div key={i} className="h-1.5 rounded-full"
                     style={{width: i===heroIdx ? 16 : 6, background: i===heroIdx ? "var(--ice)" : "var(--line-2)", transition:"width .2s ease, background-color .2s ease"}}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meta tiles — v3: widget tiles like the Profile stat strip (1c), not the
          old editorial bordered rail. */}
      <div className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="card rounded-[18px] p-3.5">
            <div className="stamp">When</div>
            <div className="font-black text-[20px] leading-none mt-1.5">{e.date.split('·')[0].trim()}</div>
            <div className="text-[11px] mt-1" style={{color:"var(--ink-mute)"}}>{e.date.split('·')[1]?.trim()}</div>
          </div>
          <div className="card rounded-[18px] p-3.5">
            <div className="stamp">Doors</div>
            <div className="font-black text-[20px] leading-none mt-1.5 font-mono">{e.time}</div>
            <div className="text-[11px] mt-1" style={{color:"var(--ink-mute)"}}>{e.endsTime ? "til " + e.endsTime : "End time TBA"}</div>
          </div>
          <div className="card rounded-[18px] p-3.5">
            <div className="stamp">Seats</div>
            <div className="font-black text-[20px] leading-none mt-1.5 font-mono"><span style={{color:"var(--ice)"}}>{seatsLeft}</span><span style={{color:"var(--ink-mute)"}}> / {e.seats}</span></div>
            <div className="text-[11px] mt-1" style={{color:"var(--ink-mute)"}}>{e.applied} applied</div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="px-5 pt-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{border:"1px solid var(--line-2)"}}>
            <Icon name="map-pin" size={14} stroke={1.5}/>
          </div>
          <div className="flex-1">
            <div className="font-display text-[16px]">{e.venue}</div>
            <div className="text-[12px] on-photo" style={{color:"var(--ink-mute)"}}>{e.area}</div>
          </div>
          <button onClick={openMaps} className="press text-[11px] px-3 h-11 rounded-full" style={{border:"1px solid var(--line-2)"}}>Map</button>
        </div>
      </div>

      {/* Applications close line — open events only */}
      {e.stage === STAGE.open && e.closesAt && (
        <div className="px-5 pt-4">
          <div className="text-[11px] on-photo" style={{color:"var(--ink-mute)"}}>Applications close · {e.closesAt}</div>
        </div>
      )}

      {/* Exchange */}
      <SectionHead label="The exchange" className="pt-8 pb-3"/>
      <div className="px-5 space-y-4">
        {[
          { n:"01", t:"One Story, on the day", s:storyWindow || "Posting window in the brief" },
          { n:"02", t:"Tag " + venueTag, s:e.venueIg ? "Use the venue handle in your Story" : "Tag the venue name in your Story" },
        ].map((r,i)=>(
          <div key={i} className="flex items-center gap-4 py-3" style={{borderBottom:"1px solid var(--line)"}}>
            <span className="font-mono text-[11px] on-photo" style={{color:"var(--ink-mute)"}}>{r.n}</span>
            <div className="flex-1">
              <div className="text-[14px]">{r.t}</div>
              <div className="text-[11px] on-photo" style={{color:"var(--ink-mute)"}}>{r.s}</div>
            </div>
            <Icon name="check" size={14} stroke={1.5} className="opacity-30"/>
          </div>
        ))}
      </div>

      <div className="h-8"/>
      </div>

      {/* Sticky CTA — sibling of the scroll container so it stays anchored */}
      <div className="dock-fade absolute left-0 right-0 bottom-0 pt-8 px-5 app-safe-bottom z-30">
        {(() => {
          // confirmed row → "View pass →"
          if (myRow && myRow.state === GS.confirmed) {
            return (
              <button onClick={()=>onOpenPass(e.id)} className="press glow-primary w-full h-[56px] rounded-full flex items-center justify-center gap-3" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
                <span className="font-semibold text-[15px]">View pass</span>
                <Icon name="arrow-right" size={16} stroke={1.6}/>
              </button>
            );
          }
          // applied / waitlist row → status + cancellation RPC
          if (myRow && [GS.applied, GS.waitlist].includes(myRow.state)) {
            return (
              <button onClick={()=>onCancel(myRow)} className="press w-full h-[56px] rounded-full flex items-center justify-center gap-3" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>
                <StatusPill label={GS_COPY[myRow.state]} tone="neutral" dot/>
                <span className="text-[11px]">Cancel application</span>
              </button>
            );
          }
          // picked row → live solid pill "Confirm your seat →" opens takeover
          if (myRow && myRow.state === GS.picked) {
            return (
              <button onClick={()=>onOpenPicked && onOpenPicked(e.id)} className="press glow-primary w-full h-[56px] rounded-full flex items-center justify-center gap-3" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
                <span className="font-semibold text-[15px]">Confirm your seat</span>
                <Icon name="arrow-right" size={16} stroke={1.6}/>
              </button>
            );
          }
          // other row states (waitlist, declined, not_selected, etc.) → quiet disabled pill
          if (myRow) {
            return (
              <div className="flex items-center justify-center py-2">
                <StatusPill label={GS_COPY[myRow.state] || myRow.state} tone="outline" dot={false}/>
              </div>
            );
          }
          // A refreshed closed/cancelled event cannot accept a new application.
          if (e.stage !== STAGE.open) {
            return (
              <button disabled className="w-full h-[56px] rounded-full flex items-center justify-center" style={{background:"var(--bg-elev2)", color:"var(--ink-mute)"}}>
                <span className="font-semibold text-[15px]">{e.stage === STAGE.cancelled ? "Event cancelled" : e.stage === STAGE.past ? "This event has ended" : "The list is closed"}</span>
              </button>
            );
          }
          // no row + open → Apply with spinner states
          return (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="stamp" style={{color:"var(--ink-mute)"}}>Closes in</div>
                <div className="font-black text-[22px] leading-none mt-0.5" style={{color:"var(--ice)"}}><Countdown value={countdownTo(deadline, clockNow)}/></div>
              </div>
              <button onClick={onApply} disabled={applyState !== 'idle'} className={"press flex items-center gap-3 h-[56px] px-6 rounded-full "+(applyState==='idle'?"glow-primary":"")} style={{background: applyState === 'idle' ? "var(--ice)" : "var(--bg-elev2)", color: applyState === 'idle' ? "var(--ice-ink)" : "var(--ink)", minWidth: 168, justifyContent:'center'}}>
                {applyState === 'idle' && (<>
                  <span className="font-semibold text-[15px]">Apply · free</span>
                  <Icon name="arrow-right" size={16} stroke={1.6}/>
                </>)}
                {applyState === 'submitting' && (<>
                  <span className="font-semibold text-[15px]">Reviewing</span>
                  <span className="spin inline-block w-4 h-4 rounded-full" style={{border:"2px solid currentColor", borderTopColor:"transparent"}}/>
                </>)}
                {applyState === 'submitted' && (<>
                  <span className="font-semibold text-[15px]">Applied</span>
                  <Icon name="check" size={16} stroke={1.8}/>
                </>)}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ========== 04 — MY EVENTS ========== */
function ScreenMyEvents({ tab, onTab, myEvents, savedEvents, onToggleSave, onPickEvent, onToast, onOpenPass, onOpenPicked, onOpenStory, initialSeg, events }){
  // Derive segments from myEvents data layer
  const appliedStates   = new Set([GS.applied, GS.waitlist, GS.picked]);
  const confirmedStates = new Set([GS.confirmed]);
  const pastStates      = new Set([GS.checkedIn, GS.noShow, GS.notSelected, GS.cancelled, GS.expired, GS.declined, GS.withdrawn]);

  const appliedRows   = myEvents.filter(r => appliedStates.has(r.state));
  const confirmedRows = myEvents.filter(r => confirmedStates.has(r.state));
  const pastRows      = myEvents.filter(r => pastStates.has(r.state));

  // Join eventId → EVENTS for display
  const joinEvent = (r) => ({ ...r, event: events.find(e => e.id === r.eventId) });

  const confirmedEvents = confirmedRows.map(joinEvent).filter(row => row.event);
  // The header calendar shortcut uses the first confirmed event; every seat renders below.
  const confirmedEvent = confirmedEvents[0]?.event || null;

  const [seg, setSeg] = useState(initialSeg || (confirmedEvent ? "confirmed" : "applied"));

  // One source of truth for the counts — the stat tiles and the segmented
  // control both read from here.
  const counts = {
    applied:   appliedRows.length,
    confirmed: confirmedRows.length,
    saved:     savedEvents.length,
    past:      pastRows.length,
  };
  const segs = [
    { id:"applied",   label:"Applied",   count: counts.applied },
    { id:"confirmed", label:"Confirmed", count: counts.confirmed },
    { id:"saved",     label:"Saved",     count: counts.saved },
    { id:"past",      label:"Past",      count: counts.past },
  ];
  const addConfirmedCalendar = () => {
    if (!confirmedEvent) { onToast("No confirmed event to add"); return; }
    if (!downloadEventCalendar(confirmedEvent)) { onToast("Event time is not available yet"); return; }
    onToast("Calendar file downloaded");
  };

  return (
    <PhoneScreen tab={tab} onTab={onTab}>
      <div className="px-5 app-safe-top pb-4 flex items-center justify-between">
        <div className="font-black font-display-l text-[36px] leading-none">Invites</div>
        <button onClick={addConfirmedCalendar} aria-label={confirmedEvent ? "Add " + confirmedEvent.title + " to calendar" : "Add confirmed event to calendar"} className="press glass w-11 h-11 rounded-full flex items-center justify-center">
          <Icon name="calendar" size={16} stroke={1.4}/>
        </button>
      </div>

      {/* Status at a glance — tap a tile to jump to that segment */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-2">
        <StatTile n={counts.applied} label="Applied" onClick={()=>setSeg("applied")}/>
        <StatTile n={counts.confirmed} label="Confirmed" ice onClick={()=>setSeg("confirmed")}/>
        <StatTile n={counts.past} label="Past" onClick={()=>setSeg("past")}/>
      </div>

      <div className="px-5 pb-4">
        <Segmented items={segs} value={seg} onChange={setSeg}/>
      </div>

      {/* CONFIRMED */}
      {seg==="confirmed" && (confirmedEvent ? (
        <div className="px-5 pt-1 space-y-6 anim-up">
          {confirmedEvents.map(({event:confirmedEvent}) => {
            const conf = parseDate(confirmedEvent.date);
            return <section key={confirmedEvent.id} aria-label={confirmedEvent.title} className="space-y-4">
          <div className="card rounded-[18px] overflow-hidden">
            <div className="relative h-[160px]">
              <img src={confirmedEvent.img} className="absolute inset-0 w-full h-full object-cover" alt=""/>
              <div className="absolute inset-0" style={{background:"linear-gradient(180deg, rgba(27,28,31,0) 30%, rgba(27,28,31,.95) 100%)"}}/>
              <div className="absolute top-3 left-3"><StatusPill label={GS_COPY[GS.confirmed]} tone="ice" dot/></div>
              <div className="absolute bottom-3 left-3 right-3" style={{color:"#F7F6F3"}}>
                <div className="font-black text-[22px] leading-none">{confirmedEvent.title}</div>
                <div className="text-[11px] mt-1 opacity-80">{confirmedEvent.venue} · {confirmedEvent.date}</div>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <DateChip day={conf.day} sub={conf.month} tone="ice"/>
              <div className="flex-1">
                <div className="stamp">Check-in</div>
                <div className="text-[13px] font-medium mt-0.5 font-mono">{confirmedEvent.time}</div>
              </div>
              <button onClick={()=>onOpenPass(confirmedEvent.id)} aria-label={"View pass for " + confirmedEvent.title} className="press px-3 h-9 rounded-full text-[11px] font-medium flex items-center gap-1.5" style={{background:"var(--ink)", color:"var(--bg)"}}>View pass <Icon name="arrow-right" size={12} stroke={1.6}/></button>
            </div>
          </div>
          <BriefBlock brief={confirmedEvent.brief}/>
            </section>;
          })}
        </div>
      ) : (
        <div className="px-5 pt-6 text-[13px] on-photo" style={{color:"var(--ink-mute)"}}>No confirmed seats yet. Apply to a room, then watch for the pick.</div>
      ))}

      {/* APPLIED — applications still under review */}
      {seg==="applied" && (appliedRows.length > 0 ? (
        <div className="px-5 pt-1 space-y-4 anim-up">
          {appliedRows.map(r => {
            const ev = events.find(e => e.id === r.eventId);
            if (!ev) return null;
            const isPicked = r.state === GS.picked;
            // Hours left to confirm — 24h from pickedAt (fallback 24 when a seed has no timestamp)
            const hoursLeft = isPicked
              ? Math.max(0, Math.ceil(((r.pickExpiresAt || ((r.pickedAt || Date.now()) + 24*3600000)) - Date.now()) / 3600000))
              : null;
            return (
              <button key={r.eventId} onClick={()=> isPicked ? onOpenPicked(r.eventId) : onPickEvent(ev)} className="press card w-full text-left flex items-center gap-3 p-3 rounded-[14px]">
                <img src={ev.img} className="w-14 h-14 rounded-[6px] object-cover" alt=""/>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-[16px]">{ev.title}</div>
                  <div className="text-[11px]" style={{color:"var(--ink-mute)"}}>{ev.venue} · {ev.date}</div>
                  <div className="mt-1.5">
                    {isPicked
                      ? <StatusPill label={"Confirm within " + hoursLeft + "h"} tone="ice" dot/>
                      : <StatusPill label={GS_COPY[r.state]} tone="outline" dot/>}
                  </div>
                </div>
                <Icon name="arrow-right" size={16} stroke={1.4} className="opacity-50"/>
              </button>
            );
          })}
          <div className="text-[12px] on-photo" style={{color:"var(--ink-mute)"}}>Venues pick applicants up to doors. We notify you if you're in. Not every application is picked.</div>
        </div>
      ) : (
        <div className="px-5 pt-6 text-[13px] on-photo" style={{color:"var(--ink-mute)"}}>Nothing under review.</div>
      ))}

      {/* SAVED — events you bookmarked. Save/unsave from any card lands here. */}
      {seg==="saved" && (savedEvents.length > 0 ? (
        <div className="px-5 pt-1 space-y-3 stagger">
          {savedEvents.map((e,i)=>(
            <div key={e.id} style={{"--i":i}} className="card flex items-center gap-3 p-3 rounded-[14px]">
              <button onClick={()=>onPickEvent(e)} className="press flex items-center gap-3 flex-1 min-w-0 text-left">
                <img src={e.img} className="w-14 h-16 rounded-[6px] object-cover shrink-0" alt=""/>
                <div className="flex-1 min-w-0">
                  <div className="stamp">{e.type}</div>
                  <div className="font-display text-[17px] mt-0.5 truncate">{e.title}</div>
                  <div className="text-[11px] truncate" style={{color:"var(--ink-mute)"}}>{e.venue} · {e.area}</div>
                  <div className="mt-1.5"><span className="font-mono text-[11px]" style={{color:"var(--ice)"}}>{e.seats} seats</span><span className="font-mono text-[11px]" style={{color:"var(--ink-mute)"}}> · {e.date}</span></div>
                </div>
              </button>
              <SaveButton saved={true} onClick={()=>onToggleSave(e.id)}/>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-16 text-center">
          <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{border:"1px solid var(--line-2)"}}>
            <Icon name="bookmark" size={18} stroke={1.4}/>
          </div>
          <div className="section-label mt-4">Nothing saved yet</div>
          <div className="text-[13px] mt-2 on-photo" style={{color:"var(--ink-mute)"}}>Tap the bookmark on any room to keep it here.</div>
        </div>
      ))}

      {/* PAST */}
      {seg==="past" && (
        <div className="px-5 pt-1 space-y-3 stagger">
          {pastRows.map((r, i) => {
            const ev = events.find(e => e.id === r.eventId);
            if (!ev) return null;
            // Quiet states — the ones that end the relationship without a night out
            const quiet = [GS.notSelected, GS.cancelled, GS.expired, GS.declined, GS.withdrawn, GS.noShow].includes(r.state);
            const storyDue = r.state === GS.checkedIn && (r.story === SS.due || r.story === SS.rejected);
            const score = r.verdict ? (r.verdict.score / 10).toFixed(1) : null;

            // Story due / rejected — the loudest card in Past: upload is the one CTA that matters
            if (storyDue) return (
              <div key={r.eventId} className="card rounded-[14px] p-3" style={{"--i":i, border:"1px solid var(--line-2)"}}>
                <div className="flex items-center gap-3">
                  <img src={ev.img} className="w-14 h-14 rounded-[6px] object-cover" alt=""/>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[16px]">{ev.title}</div>
                    <div className="text-[11px]" style={{color:"var(--ink-mute)"}}>{ev.venue} · {ev.date}</div>
                    <div className="mt-1.5"><StatusPill label={SS_COPY[r.story]} tone={r.story === SS.rejected ? "outline" : "ice"} dot/></div>
                  </div>
                </div>
                {r.story === SS.rejected && r.verdict && (
                  <div className="text-[11px] mt-2.5" style={{color:"var(--ink-mute)"}}>{r.verdict.reason}</div>
                )}
                <button onClick={()=>onOpenStory(r.eventId)} className="press w-full h-11 rounded-full text-[12px] font-semibold mt-3 flex items-center justify-center gap-2" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
                  Upload your Story <Icon name="arrow-right" size={14} stroke={1.6}/>
                </button>
              </div>
            );

            // Everything else — one calm row; story axis rides as a second pill
            return (
              <div key={r.eventId} className="card flex items-center gap-3 p-3 rounded-[14px]" style={{"--i":i, opacity: quiet ? 0.6 : 1}}>
                <img src={ev.img} className="w-14 h-14 rounded-[6px] object-cover" style={{filter: quiet ? "grayscale(1)" : "grayscale(.25)"}} alt=""/>
                <div className="flex-1">
                  <div className="font-display text-[16px]">{ev.title}</div>
                  <div className="text-[11px]" style={{color:"var(--ink-mute)"}}>{ev.venue} · {ev.date}</div>
                  {r.state === GS.cancelled && (
                    <div className="text-[11px] mt-1" style={{color:"var(--ink-mute)"}}>Event cancelled · no strike</div>
                  )}
                </div>
                <div className="text-right">
                  {r.state === GS.checkedIn && r.story
                    ? <StatusPill label={SS_COPY[r.story]} tone={r.story === SS.verified ? "ice" : "outline"} dot={r.story === SS.verified}/>
                    : <StatusPill label={GS_COPY[r.state] || r.state} tone={quiet ? "outline" : "neutral"}/>}
                  {score && r.story === SS.verified && <div className="font-black text-[18px] font-mono mt-1" style={{color:"var(--ice)"}}>{score}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-8"/>
    </PhoneScreen>
  );
}

/* ========== 05 - PROFILE ANALYTICS ========== */
function hasProfileMetric(value){
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function formatProfileNumber(value, options={}){
  if (!hasProfileMetric(value)) return "Not available";
  const number = Number(value);
  const decimals = options.decimals ?? 0;
  if (options.compact && Math.abs(number) >= 1000000) {
    return (number / 1000000).toFixed(Math.abs(number) >= 10000000 ? 0 : 1).replace(/\.0$/, "") + "m";
  }
  if (options.compact && Math.abs(number) >= 1000) {
    return (number / 1000).toFixed(Math.abs(number) >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  }
  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + (options.suffix || "");
}

function formatProfilePercent(value, options={}){
  if (!hasProfileMetric(value)) return "Not available";
  const raw = Number(value);
  const percent = Math.abs(raw) <= 1 ? raw * 100 : raw;
  const prefix = options.signed && percent > 0 ? "+" : "";
  return prefix + percent.toFixed(options.decimals ?? 0).replace(/\.0$/, "") + "%";
}

function formatProfileUpdated(value){
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Not available";
  return date.toLocaleString("en-GB", {
    day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12:false,
  });
}

function profileLebanonShare(profile, analytics){
  if (hasProfileMetric(analytics?.audience?.lebanon_pct)) return Number(analytics.audience.lebanon_pct);
  const countries = Array.isArray(profile?.audience?.country_split) ? profile.audience.country_split : [];
  const lebanon = countries.find(row => row.code === "LB" || String(row.label).toLowerCase() === "lebanon");
  return hasProfileMetric(lebanon?.pct) ? Number(lebanon.pct) : null;
}

function ProfileMetricBox({ value, label, className="" }){
  const unavailable = value === "Not available";
  return (
    <div className={"card rounded-[12px] p-3 min-h-[82px] flex flex-col justify-between "+className}>
      <div className={"font-mono font-black leading-tight break-words "+(unavailable ? "text-[13px]" : "text-[20px]")}>{value}</div>
      <div className="text-[10px] leading-tight mt-2" style={{color:"var(--ink)"}}>{label}</div>
    </div>
  );
}

function ProfileBars({ rows }){
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!safeRows.length) {
    return <div className="text-[12px] py-6" style={{color:"var(--ink)"}}>Not available</div>;
  }
  return (
    <div className="space-y-3">
      {safeRows.map((row, index) => {
        const value = hasProfileMetric(row.pct) ? Math.max(0, Math.min(1, Number(row.pct))) : null;
        return (
          <div key={(row.label || "row")+"-"+index}>
            <div className="flex items-center justify-between gap-3 text-[11px] mb-1.5" style={{color:"var(--ink)"}}>
              <span>{row.label || "Not available"}</span>
              <span className="font-mono shrink-0">{formatProfilePercent(value)}</span>
            </div>
            <div className="analytics-bar-track">
              {value !== null && <div className="analytics-bar-fill" style={{width:(value * 100)+"%"}}/>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileDonut({ value, label, sublabel, size=116 }){
  const available = hasProfileMetric(value);
  const pct = available ? Math.max(0, Math.min(100, Number(value) * 100)) : 0;
  const background = available
    ? "conic-gradient(var(--ice) 0 "+pct+"%, var(--bg-elev2) "+pct+"% 100%)"
    : "var(--bg-elev2)";
  return (
    <div className="analytics-donut" style={{width:size, height:size, background}}>
      <div className="analytics-donut-value">
        <div className={available ? "font-black font-mono text-[22px]" : "text-[9px] text-center px-4"}>{available ? Math.round(pct)+"%" : "Not available"}</div>
        {available && <div className="text-[9px] mt-0.5">{label}</div>}
        {available && sublabel && <div className="text-[8px]">{sublabel}</div>}
      </div>
    </div>
  );
}

function ProfileTrendChart({ rows }){
  const data = Array.isArray(rows) ? rows : [];
  const pointsFor = (key) => {
    const values = data.map(row => hasProfileMetric(row[key]) ? Number(row[key]) : null).filter(value => value !== null);
    if (values.length < 2) return "";
    const min = Math.min(...values);
    const spread = Math.max(...values) - min || 1;
    return data.map((row, index) => {
      if (!hasProfileMetric(row[key])) return null;
      const x = 12 + index * (296 / Math.max(1, data.length - 1));
      const y = 132 - ((Number(row[key]) - min) / spread) * 104;
      return x.toFixed(1)+","+y.toFixed(1);
    }).filter(Boolean).join(" ");
  };
  const reachPoints = pointsFor("reach");
  const engagementPoints = pointsFor("engagement");
  const last = data[data.length - 1] || {};

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] flex items-center gap-2"><span className="w-5 h-[2px]" style={{background:"var(--ice)"}}/>Reach</div>
          <div className="font-mono text-[14px] mt-1">{formatProfileNumber(last.reach, {compact:true})}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] flex items-center justify-end gap-2"><span className="w-5" style={{borderTop:"2px dashed var(--ink)"}}/>Engagement</div>
          <div className="font-mono text-[14px] mt-1">{formatProfilePercent(last.engagement, {decimals:1})}</div>
        </div>
      </div>
      {(reachPoints || engagementPoints) ? (
        <>
          <svg viewBox="0 0 320 144" className="w-full h-[144px]" role="img" aria-label="Reach and engagement trend">
            {[28,62,96,130].map(y => <line key={y} x1="10" x2="310" y1={y} y2={y} className="profile-chart-grid"/>)}
            {reachPoints && <polyline points={reachPoints} className="profile-chart-line"/>}
            {engagementPoints && <polyline points={engagementPoints} className="profile-chart-line secondary"/>}
          </svg>
          <div className="flex justify-between text-[9px]" style={{color:"var(--ink)"}}>
            <span>{data[0]?.label || ""}</span>
            <span>{last.label || ""}</span>
          </div>
        </>
      ) : (
        <div className="h-[144px] flex items-center justify-center text-[12px]" style={{color:"var(--ink)"}}>Not available</div>
      )}
    </div>
  );
}

function ProfileSparkline({ values }){
  const safe = Array.isArray(values) ? values.filter(hasProfileMetric).map(Number) : [];
  if (safe.length < 2) return <div className="h-[112px] flex items-center justify-center text-[12px]">Not available</div>;
  const min = Math.min(...safe);
  const spread = Math.max(...safe) - min || 1;
  const pointRows = safe.map((value, index) => {
    const x = 12 + index * (296 / Math.max(1, safe.length - 1));
    const y = 96 - ((value - min) / spread) * 70;
    return {x:x.toFixed(1), y:y.toFixed(1)};
  });
  return (
    <svg viewBox="0 0 320 112" className="w-full h-[112px]" role="img" aria-label="Last six event performance">
      {[26,61,96].map(y => <line key={y} x1="10" x2="310" y1={y} y2={y} className="profile-chart-grid"/>)}
      <polyline points={pointRows.map(point => point.x+","+point.y).join(" ")} className="profile-chart-line"/>
      {pointRows.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="3.5" fill="var(--ice)"/>)}
    </svg>
  );
}

function ProfileContentThumb({ item, index }){
  const [failed, setFailed] = useState(false);
  const available = item && item.image_url && !failed;
  return (
    <div className="card rounded-[12px] overflow-hidden min-w-0">
      <div className="aspect-[4/5]">
        {available ? (
          <img
            src={item.image_url}
            loading="lazy"
            decoding="async"
            onError={()=>setFailed(true)}
            className="w-full h-full object-cover"
            alt={item.label || "Top content "+(index+1)}
          />
        ) : (
          <div className="profile-thumb-fallback">Thumbnail not available</div>
        )}
      </div>
      <div className="p-2.5">
        <div className="text-[10px] font-semibold truncate">{item?.type || "Not available"}</div>
        <div className="text-[9px] mt-1 truncate">{item?.label || "Not available"}</div>
        <div className="font-mono text-[11px] mt-1">{formatProfileNumber(item?.views, {compact:true})}</div>
      </div>
    </div>
  );
}

function ProfileOverview({ profile, analytics, period, verified }){
  const periodData = analytics?.periods?.[period] || null;
  const lebanon = profileLebanonShare(profile, analytics);
  const mainValue = verified
    ? formatProfileNumber(periodData?.average_story_reach, {compact:true})
    : formatProfilePercent(profile.engagement_rate, {decimals:1});
  const mainLabel = verified ? "Average Story reach" : "Engagement rate";

  return (
    <div className="px-5 pt-5 pb-5 space-y-6 anim-fade">
      <div className="card rounded-[14px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold">{mainLabel}</div>
          <StatusPill label={verified ? "Verified" : "Estimated"} tone={verified ? "ice" : "outline"}/>
        </div>
        <div className={"font-black font-display-l mt-5 break-words "+(mainValue === "Not available" ? "text-[18px]" : "text-[44px] leading-none")}>{mainValue}</div>
        <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px]" style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>
          <Icon name="check" size={11} stroke={1.6}/>
          <span>Audience credibility</span>
          <span className="font-mono">{formatProfilePercent(analytics?.audience_credibility)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ProfileMetricBox value={formatProfileNumber(profile.followers_count, {compact:true})} label="Followers"/>
        <ProfileMetricBox value={formatProfilePercent(analytics?.follower_growth_30d, {signed:true, decimals:1})} label="30-day follower growth"/>
        <ProfileMetricBox value={formatProfilePercent(lebanon)} label="Lebanon audience"/>
        <ProfileMetricBox value={formatProfileNumber(periodData?.average_reels_views, {compact:true})} label="Average Reels views"/>
      </div>

      <div>
        <SectionHead label="Reach and engagement" right={period+" days"} className="!px-0 pb-3"/>
        <div className="card rounded-[14px] p-4">
          <ProfileTrendChart rows={periodData?.trend}/>
        </div>
      </div>
    </div>
  );
}

function ProfileAudience({ profile, analytics }){
  const audience = analytics?.audience || {};
  const lebanon = profileLebanonShare(profile, analytics);
  const international = hasProfileMetric(lebanon) ? Math.max(0, 1 - Number(lebanon)) : null;
  const gender = audience.gender || profile?.audience?.gender_split || {};
  const rawAge = audience.age_groups || profile?.audience?.age_split;
  const ageRows = Array.isArray(rawAge)
    ? rawAge.map(row => ({label:row.label, pct:row.pct}))
    : rawAge && typeof rawAge === "object"
      ? Object.entries(rawAge).map(([label,pct]) => ({label,pct}))
      : [];
  const languages = Array.isArray(audience.languages) && audience.languages.length
    ? audience.languages.join(", ")
    : "Not available";

  return (
    <div className="px-5 pt-5 pb-5 space-y-7 anim-fade">
      <div>
        <SectionHead label="Audience location" className="!px-0 pb-3"/>
        <div className="card rounded-[14px] p-4 flex items-center gap-5">
          <ProfileDonut value={lebanon} label="Lebanon"/>
          <div className="min-w-0 flex-1 space-y-3">
            <div><div className="text-[10px]">Lebanon</div><div className="font-mono text-[18px]">{formatProfilePercent(lebanon)}</div></div>
            <div className="hr"/>
            <div><div className="text-[10px]">International</div><div className="font-mono text-[18px]">{formatProfilePercent(international)}</div></div>
          </div>
        </div>
      </div>

      <div><SectionHead label="Top cities" className="!px-0 pb-3"/><ProfileBars rows={audience.top_cities}/></div>
      <div><SectionHead label="Age groups" className="!px-0 pb-3"/><ProfileBars rows={ageRows}/></div>

      <div>
        <SectionHead label="Gender" className="!px-0 pb-3"/>
        <div className="card rounded-[14px] p-4 flex items-center gap-5">
          <ProfileDonut value={gender.female} label="Female" size={100}/>
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center justify-between text-[11px]"><span>Female</span><span className="font-mono">{formatProfilePercent(gender.female)}</span></div>
            <div className="hr"/>
            <div className="flex items-center justify-between text-[11px]"><span>Male</span><span className="font-mono">{formatProfilePercent(gender.male)}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ProfileMetricBox value={formatProfilePercent(analytics?.audience_credibility)} label="Audience credibility"/>
        <ProfileMetricBox value={languages} label="Languages"/>
        <ProfileMetricBox value={audience.strongest_active_hours || "Not available"} label="Strongest active hours" className="col-span-2"/>
      </div>
    </div>
  );
}

function ProfileContent({ analytics, period }){
  const content = analytics?.content || {};
  const periodContent = content.periods?.[period] || content;
  const topContent = Array.isArray(content.top_content) ? content.top_content.slice(0,4) : [];
  const thumbs = Array.from({length:4}, (_,index) => topContent[index] || null);
  const averages = periodContent.averages || {};
  const typeRows = Array.isArray(content.type_performance)
    ? content.type_performance.map(row => ({label:row.label, pct:row.score}))
    : [];

  return (
    <div className="px-5 pt-5 pb-5 space-y-7 anim-fade">
      <div>
        <SectionHead label="Top content" right={period+" days"} className="!px-0 pb-3"/>
        <div className="grid grid-cols-2 gap-2">
          {thumbs.map((item,index) => <ProfileContentThumb key={(item?.image_url || "missing")+"-"+index} item={item} index={index}/>)}
        </div>
      </div>

      <div><SectionHead label="Content-type performance" className="!px-0 pb-3"/><ProfileBars rows={typeRows}/></div>

      <div>
        <SectionHead label="Average performance" className="!px-0 pb-3"/>
        <div className="grid grid-cols-2 gap-2">
          <ProfileMetricBox value={formatProfileNumber(averages.views, {compact:true})} label="Average views"/>
          <ProfileMetricBox value={formatProfileNumber(averages.likes, {compact:true})} label="Average likes"/>
          <ProfileMetricBox value={formatProfileNumber(averages.comments, {compact:true})} label="Average comments"/>
          <ProfileMetricBox value={formatProfileNumber(averages.saves, {compact:true})} label="Average saves"/>
          <ProfileMetricBox value={formatProfileNumber(averages.shares, {compact:true})} label="Average shares" className="col-span-2"/>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ProfileMetricBox value={hasProfileMetric(periodContent.posts_per_week) ? formatProfileNumber(periodContent.posts_per_week, {decimals:1})+" / week" : "Not available"} label="Posting frequency"/>
        <ProfileMetricBox value={formatProfilePercent(periodContent.sponsored_pct)} label="Sponsored content"/>
      </div>
    </div>
  );
}

function ProfileListRecord({ analytics, live, record, profile, loading }){
  if (live) {
    if (loading) return (
      <div className="px-5 py-16 text-center anim-fade">
        <span className="spin inline-block w-6 h-6 rounded-full" style={{border:"2px solid var(--line-2)", borderTopColor:"var(--ice)"}}/>
        <div className="text-[12px] mt-3">Loading your record</div>
      </div>
    );
    const applications = Number(record?.applications || 0);
    if (!applications) return (
      <div className="px-5 py-16 text-center anim-fade">
        <div className="section-label">No record yet</div>
        <div className="text-[13px] mt-2">Your attendance and Story record starts after your first application.</div>
      </div>
    );
    const attended = Number(record?.attended || 0);
    const noShows = Number(record?.no_shows || 0);
    const verifiedStories = Number(record?.stories_verified || 0);
    const missedStories = Number(record?.stories_missed || 0);
    const attendanceOutcomes = attended + noShows;
    const storyOutcomes = verifiedStories + missedStories;
    const showUpRate = attendanceOutcomes ? attended / attendanceOutcomes : null;
    const storyCompletion = storyOutcomes ? verifiedStories / storyOutcomes : null;
    const derivedReliability = [showUpRate, storyCompletion].filter(hasProfileMetric);
    const reliabilityNumber = hasProfileMetric(profile?.reputation)
      ? Number(profile.reputation)
      : derivedReliability.length ? (derivedReliability.reduce((sum,value)=>sum+Number(value),0) / derivedReliability.length) * 10 : null;
    const reliability = hasProfileMetric(reliabilityNumber) ? formatProfileNumber(reliabilityNumber, {decimals:1}) + " / 10" : "New record";
    const rating = hasProfileMetric(record?.avg_rating) ? formatProfileNumber(record.avg_rating, {decimals:1}) + " / 10" : "No ratings yet";
    return (
      <div className="px-5 pt-5 pb-5 space-y-7 anim-fade">
        <div className="card rounded-[14px] p-5">
          <div className="text-[11px] font-semibold">Reliability score</div>
          <div className={"font-black font-display-l mt-5 break-words "+(hasProfileMetric(reliabilityNumber) ? "text-[42px] leading-none" : "text-[20px]")}>{reliability}</div>
          <div className="text-[10px] mt-3">Based on {applications} application{applications === 1 ? "" : "s"}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ProfileMetricBox value={showUpRate === null ? "No completed nights" : formatProfilePercent(showUpRate)} label="Show-up rate"/>
          <ProfileMetricBox value={storyCompletion === null ? "No stories due" : formatProfilePercent(storyCompletion)} label="Story completion"/>
          <ProfileMetricBox value={rating} label="Average venue rating"/>
          <ProfileMetricBox value={formatProfileNumber(attended)} label="Events attended"/>
          <ProfileMetricBox value={formatProfileNumber(verifiedStories)} label="Stories verified"/>
          <ProfileMetricBox value={formatProfileNumber(noShows)} label="Exact no-shows"/>
        </div>
      </div>
    );
  }
  const demoRecord = analytics?.the_list || {};
  const reliability = hasProfileMetric(demoRecord.reliability_score)
    ? formatProfileNumber(demoRecord.reliability_score, {decimals:1})+" / 10"
    : "Not available";
  const venueRating = hasProfileMetric(demoRecord.average_venue_rating)
    ? formatProfileNumber(demoRecord.average_venue_rating, {decimals:1})+" / 5"
    : "Not available";

  return (
    <div className="px-5 pt-5 pb-5 space-y-7 anim-fade">
      <div className="card rounded-[14px] p-5">
        <div className="text-[11px] font-semibold">Reliability score</div>
        <div className={"font-black font-display-l mt-5 break-words "+(reliability === "Not available" ? "text-[18px]" : "text-[42px] leading-none")}>{reliability}</div>
        <div className="text-[10px] mt-3">All-time member record</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ProfileMetricBox value={formatProfilePercent(demoRecord.show_up_rate)} label="Show-up rate"/>
        <ProfileMetricBox value={formatProfilePercent(demoRecord.story_completion)} label="Story completion"/>
        <ProfileMetricBox value={venueRating} label="Average venue rating"/>
        <ProfileMetricBox value={formatProfileNumber(demoRecord.events_attended)} label="Events attended"/>
        <ProfileMetricBox value={formatProfileNumber(demoRecord.total_verified_reach, {compact:true})} label="Total verified reach"/>
        <ProfileMetricBox value={formatProfileNumber(demoRecord.no_shows)} label="Exact no-shows"/>
        <ProfileMetricBox value={formatProfileNumber(demoRecord.active_strikes)} label="Active strikes" className="col-span-2"/>
      </div>

      <div>
        <SectionHead label="Last six events" right="Performance" className="!px-0 pb-3"/>
        <div className="card rounded-[14px] p-4">
          <ProfileSparkline values={demoRecord.last_six}/>
          {Array.isArray(demoRecord.last_six) && demoRecord.last_six.length >= 2 && (
            <div className="flex justify-between text-[9px] mt-1"><span>Six events ago</span><span>Latest event</span></div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScreenProfile({ tab, onTab, profile, onSettings, onVerify, live, memberRecord, memberRecordLoading, onLoadRecord }){
  const p = profile || (!live ? SEED_PROFILE : {});
  const analytics = p.analytics || null;
  const verified = p.data_status === "verified";
  const [profileTab, setProfileTab] = useState("overview");
  const [period, setPeriod] = useState("30");
  useEffect(() => {
    if (profileTab === "list" && live && !memberRecord && !memberRecordLoading && onLoadRecord) onLoadRecord();
  }, [profileTab, live, memberRecord, memberRecordLoading]);
  const fullName = p.full_name || "Member profile";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Member";
  const lastName = nameParts.slice(1).join(" ");
  const handle = p.handle || p.ig_handle;
  const tier = "Tier " + (hasProfileMetric(p.tier_suggestion) ? p.tier_suggestion : 1);
  const createdAt = p.created_at ? new Date(p.created_at) : null;
  const memberSince = createdAt && !Number.isNaN(createdAt.valueOf())
    ? createdAt.toLocaleDateString("en-GB", {month:"short", year:"numeric"})
    : (p.member_since || (p.demo_profile ? "2024" : null));
  const memberNumber = hasProfileMetric(p.member_no) ? String(p.member_no).padStart(3,"0") : (p.demo_profile ? "048" : "---");
  const profileTabs = [
    {id:"overview", label:"Overview"},
    {id:"audience", label:"Audience"},
    {id:"content", label:"Content"},
    {id:"list", label:"The List"},
  ];
  const changeProfileTab = (event, nextTab) => {
    setProfileTab(nextTab);
    if (nextTab === "list" && live && !memberRecord && onLoadRecord) onLoadRecord();
    const scroller = event.currentTarget.closest(".noscroll.overflow-y-auto");
    if (scroller && scroller.scrollTop > 300) scroller.scrollTo({top:246, behavior:"smooth"});
  };

  return (
    <PhoneScreen tab={tab} onTab={onTab}>
      <div className="relative h-[300px]">
        {p.profile_picture_url ? (
          <img src={p.profile_picture_url} className="profile-hero-img absolute inset-0 w-full h-full object-cover" alt={fullName}/>
        ) : (
          <div className="profile-hero-img absolute inset-0 flex items-center justify-center" style={{background:"var(--bg-elev2)"}}>
            <Icon name="user" size={44} stroke={1.2}/>
          </div>
        )}
        <div className="profile-hero-overlay absolute inset-0"/>

        <div className="absolute app-top-controls left-5 right-5 flex items-center justify-between z-10">
          <div className="profile-glass flex items-center gap-2 px-2.5 py-1 rounded-full min-w-0">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:"var(--ice)"}}/>
            <span className="text-[9px] font-semibold truncate">{verified ? "Verified" : "Estimated"} &middot; {tier}</span>
          </div>
          <button onClick={onSettings} aria-label="Settings" className="profile-glass press hit-44 w-9 h-9 rounded-full flex items-center justify-center shrink-0">
            <Icon name="settings" size={15} stroke={1.4}/>
          </button>
        </div>

        <div className="profile-hero-text absolute right-3 top-[112px] vt z-10">
          <span className="text-[9px] font-semibold">Beirut &middot; No. {memberNumber}</span>
        </div>

        <div className="profile-hero-text absolute bottom-4 left-5 right-12 z-10">
          <div className="text-[9px] font-semibold mb-2">{memberSince ? "Member since "+memberSince : "Member"}</div>
          <div className="font-black font-display-l text-[36px] leading-[0.92] break-words">{firstName}{lastName ? <><br/>{lastName}</> : ""}</div>
          <div className="flex items-center gap-2 mt-2.5 min-w-0">
            <Icon name="instagram" size={12} stroke={1.5}/>
            <span className="text-[11px] truncate">{handle ? "@"+handle : "Handle not available"}</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs-shell">
        <div className="profile-tabs" role="tablist" aria-label="Profile analytics">
          {profileTabs.map(item => (
            <button key={item.id} role="tab" aria-selected={profileTab === item.id} onClick={(event)=>changeProfileTab(event, item.id)} className={"press "+(profileTab === item.id ? "active" : "")}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[12px] font-semibold">{verified ? "Connected insights" : "Handle-only insights"}</div>
            <div className="text-[9px] mt-1" style={{color:"var(--ink)"}}>
              {verified ? "Last updated "+formatProfileUpdated(p.fetched_at || p.verified_at) : "Estimated from public profile signals"}
            </div>
          </div>
          <StatusPill label={verified ? "Verified" : "Estimated"} tone={verified ? "ice" : "outline"}/>
        </div>
        <Segmented value={period} onChange={setPeriod} items={[
          {id:"7", label:"7 days"},
          {id:"30", label:"30 days"},
          {id:"90", label:"90 days"},
        ]}/>
      </div>

      {!verified && (
        <div className="card mx-5 mt-4 px-3 py-3 rounded-[12px] flex items-center gap-3">
          <Icon name="instagram" size={16} stroke={1.5}/>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold">Verify with Instagram</div>
            <div className="text-[9px] mt-1 leading-relaxed">Connect for verified reach, reporting timestamps, and private account insights.</div>
          </div>
          <button onClick={onVerify} className="press px-3 h-11 rounded-full text-[10px] font-semibold shrink-0" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
            Connect
          </button>
        </div>
      )}

      {profileTab === "overview" && <ProfileOverview profile={p} analytics={analytics} period={period} verified={verified}/>}
      {profileTab === "audience" && <ProfileAudience profile={p} analytics={analytics}/>}
      {profileTab === "content" && <ProfileContent analytics={analytics} period={period}/>}
      {profileTab === "list" && <ProfileListRecord analytics={analytics} live={live} record={memberRecord} profile={p} loading={memberRecordLoading}/>}

      <div className="h-8"/>
    </PhoneScreen>
  );
}

/* ========== 06 — PICKED (full-screen takeover) ========== */
function ScreenPicked({ event, pickedAt, pickExpiresAt, onConfirm, onDecline, live }){
  const e = event || (!live ? SEED_EVENTS[0] : null);

  // Live uses the server deadline directly. Demo keeps the 24-hour timer.
  const computeRemaining = () => {
    const deadline = pickExpiresAt || (pickedAt ? pickedAt + 24 * 60 * 60 * 1000 : null);
    if (!deadline) return live ? "Deadline unavailable" : "23:59:59";
    const diff = Math.max(0, deadline - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
  };
  const [remaining, setRemaining] = useState(computeRemaining);
  const countdownRef = useRef(null);
  useEffect(() => {
    if (!pickExpiresAt && !pickedAt) return;
    setRemaining(computeRemaining());
    countdownRef.current = setInterval(() => setRemaining(computeRemaining()), 1000);
    return () => clearInterval(countdownRef.current);
  }, [pickedAt, pickExpiresAt]);

  if (!e) return (
    <div className="absolute inset-0 flex items-center justify-center px-8 text-center" style={{background:"#000000", color:"#F7F6F3"}}>
      <div><div className="font-black text-[24px]">Invitation unavailable</div><div className="text-[13px] mt-3">Refresh your account and try again.</div></div>
    </div>
  );

  return (
    <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>

      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img src={e.img} className="absolute inset-0 w-full h-full object-cover" alt="" style={{filter:"blur(40px) brightness(.4)"}}/>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col px-7 app-flow">
        <div className="stamp wordmark picked-stagger" style={{color:"#F7F6F3", textShadow:"0 1px 8px rgba(0,0,0,.5)", animationDelay:"0ms"}}>The List · invitation</div>

        <div className="flex-1 flex flex-col justify-center items-center text-center -mt-6">
          <div className="w-[180px] h-[180px] rounded-full flex items-center justify-center pulse-ice ring-pop" style={{background:"#F7F6F3", color:"#000000", animationDelay:"120ms"}}>
            <div className="font-black text-[48px] leading-none">You're<br/>in</div>
          </div>
          <div className="font-black font-display-l text-[34px] leading-[0.95] mt-10 picked-stagger" style={{animationDelay:"680ms"}}>{e.title}</div>
          <div className="text-[13px] mt-2 opacity-75 picked-stagger" style={{animationDelay:"820ms"}}>{e.venue} · {e.date} · {e.time}</div>

          <div className="mt-8 px-4 py-3 rounded-[12px] picked-stagger" style={{background:"rgba(247,246,243,.08)", border:"1px solid rgba(247,246,243,.15)", animationDelay:"960ms"}}>
            <div className="stamp" style={{color:"rgba(247,246,243,.65)", textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>Confirm within</div>
            <div className="font-black text-[28px] mt-0.5" style={{color:"#F7F6F3"}}><Countdown value={remaining}/></div>
          </div>
        </div>

        <div className="flex flex-col gap-3 picked-stagger" style={{animationDelay:"1120ms"}}>
          <button onClick={onConfirm} className="press glow-primary w-full h-[58px] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2.5" style={{background:"#F7F6F3", color:"#000000"}}>
            <span>Confirm my seat</span>
            <Icon name="arrow-right" size={16} stroke={1.6}/>
          </button>
          <button onClick={onDecline} className="press w-full h-[58px] rounded-full font-medium text-[13px]" style={{background:"transparent", color:"#F7F6F3", border:"1px solid rgba(247,246,243,.2)"}}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Pass — the ticket artifact (T12) ==========
   Full-screen over the tab bar. What she shows at the door: photo, name,
   the big short code, the Brief. Door staff eyeballs the code against the
   venue's Door list (same codes, venue.html). No QR, no camera — v1 spec. ========== */
function BriefBlock({ brief, className="" }){
  if (!brief) return null;
  const rows = [
    ["Arrival window", brief.arrival],
    ["Dress code",     brief.dress],
    ["Meeting point",  brief.meeting],
    ["House rules",    brief.rules],
  ].filter(r => r[1]);
  if (!rows.length) return null;
  return (
    <div className={className}>
      <div className="stamp mb-2">The brief</div>
      <div className="card rounded-[14px] px-4">
        {rows.map(([label, val], i) => (
          <div key={label} className="flex items-start justify-between gap-4 py-3" style={i > 0 ? {borderTop:"1px solid var(--line)"} : null}>
            <div className="text-[11px] shrink-0 pt-0.5" style={{color:"var(--ink-mute)"}}>{label}</div>
            <div className="text-[13px] text-right">{val}</div>
          </div>
        ))}
      </div>
      <div className="text-[11px] mt-2.5" style={{color:"var(--ink-mute)"}}>Plans change? The List handles it.</div>
    </div>
  );
}

function ScreenPass({ event, row, profile, onBack, onRefresh, live }){
  const e = event || (!live ? SEED_EVENTS[0] : null);
  const p = profile || (!live ? SEED_PROFILE : null);
  const checkedIn = row && row.state === GS.checkedIn;
  const refreshTried = useRef(false);
  useEffect(() => {
    if (live && e && row && !row.code && !refreshTried.current && onRefresh) {
      refreshTried.current = true;
      onRefresh();
    }
  }, [live, e?.id, row?.code]);
  if (!e || !p || !row) return (
    <div className="absolute inset-0 screen-ground flex flex-col items-center justify-center px-8 text-center">
      <div className="section-label">Pass unavailable</div>
      <div className="text-[13px] mt-2">Your pass could not be loaded.</div>
      <button onClick={onBack} className="press h-12 px-5 rounded-full mt-6" style={{border:"1px solid var(--line-2)"}}>Go back</button>
    </div>
  );
  if (live && !row.code) return (
    <div className="absolute inset-0 screen-ground flex flex-col items-center justify-center px-8 text-center">
      <div className="section-label">Pass is still syncing</div>
      <div className="text-[13px] mt-2">We could not load your door code yet.</div>
      <button onClick={onRefresh} className="press h-12 px-5 rounded-full mt-6" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>Try again</button>
      <button onClick={onBack} className="press h-11 px-5 rounded-full mt-2">Go back</button>
    </div>
  );
  return (
    <div className="absolute inset-0 anim-fade noscroll overflow-y-auto screen-ground">
      <div className="px-5 app-safe-top app-safe-bottom">
        <div className="flex items-center justify-between">
          <button onClick={onBack} aria-label="Back" className="press glass w-10 h-10 rounded-full flex items-center justify-center">
            <Icon name="arrow-left" size={16} stroke={1.4}/>
          </button>
          <div className="stamp wordmark">The List · pass</div>
          <div className="w-10"/>
        </div>

        {/* The ticket */}
        <div className="card rounded-[18px] mt-6 overflow-hidden">
          <div className="px-6 pt-7 pb-6 text-center">
            {p.profile_picture_url ? <img src={p.profile_picture_url} className="w-[76px] h-[76px] rounded-full object-cover mx-auto" style={{border:"1px solid var(--line-2)"}} alt=""/> : <div className="w-[76px] h-[76px] rounded-full mx-auto flex items-center justify-center" style={{border:"1px solid var(--line-2)"}}><Icon name="user" size={26} stroke={1.3}/></div>}
            <div className="font-black font-display text-[26px] leading-none mt-4">{p.full_name}</div>
            {(p.handle || p.ig_handle) && <div className="text-[11px] mt-1.5" style={{color:"var(--ink-mute)"}}>@{p.handle || p.ig_handle}</div>}
          </div>
          <div className="mx-5" style={{borderTop:"1px dashed var(--line-2)"}}/>
          <div className="px-6 py-5 text-center">
            <div className="font-display text-[19px]">{e.title}</div>
            <div className="text-[12px] mt-1" style={{color:"var(--ink-mute)"}}>{e.venue} · {e.area}</div>
            <div className="text-[12px] mt-0.5 font-mono">{e.date} · Doors {e.doors || e.time}</div>
            <div className="stamp mt-5">Door code</div>
            <div className="font-black font-display-l leading-none mt-1" style={{fontSize:56, letterSpacing:".08em"}}>{row.code}</div>
          </div>
          {checkedIn ? (
            <div className="px-6 py-3.5 text-center text-[13px] font-medium" style={{background:"var(--ice)", color:"var(--ice-ink)"}}>
              Checked in ✓{row.inAt ? " · " + row.inAt : ""}
            </div>
          ) : (
            <div className="px-6 py-3.5 text-center text-[12px]" style={{background:"var(--bg-elev)", color:"var(--ink-mute)", borderTop:"1px solid var(--line)"}}>
              Show this at the door
            </div>
          )}
        </div>

        <BriefBlock brief={e.brief} className="mt-6"/>
        <div className="h-6"/>
      </div>
    </div>
  );
}

/* ========== Intro video background — crossfading 5s clips ==========
   TSS-style: full-bleed grainy montage that cross-dissolves between clips,
   each held ~5s, looping. Muted + autoplay + playsInline so it runs as a
   silent hero background. Grain/vignette/scrims layered on top for legibility.
==================================================================== */
function IntroVideoBG(){
  const [active, setActive] = useState(0);
  const vids = useRef([]);
  const reduce = typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) return;                       // hold first frame if reduced-motion
    const id = setInterval(() => setActive(a => (a + 1) % INTRO_CLIPS.length), 5000);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    const v = vids.current[active];
    if (v) { try { v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(()=>{}); } catch(e){} }
  }, [active]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{background:"#000000"}}>
      {INTRO_CLIPS.map((c,i)=>(
        <video key={i} ref={el => vids.current[i] = el}
          src={c.src} poster={c.poster}
          muted loop playsInline autoPlay preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{opacity: i===active ? 1 : 0, transition:"opacity 1.1s ease", filter:"contrast(1.08) saturate(.82)"}}/>
      ))}
      {/* baked grain reinforced */}
      <div className="absolute inset-0 grain" style={{opacity:.55}}/>
      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{boxShadow:"inset 0 0 170px 46px rgba(0,0,0,.82)"}}/>
      {/* top + bottom scrims for status bar / lockup / buttons */}
      <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 46%, rgba(0,0,0,.92) 100%)"}}/>
    </div>
  );
}

/* ========== 00 — ONBOARDING ========== */
/* Step indicator — numbered circles joined by a hairline, current = accent fill
   (kit 05 progress pattern). `dark` forces the cream-on-dark palette on the
   hardcoded takeover screens so it reads in both themes. Visual only. */
function Steps({ current, total=3, dark=false, className="" }){
  const accent    = dark ? "#F7F6F3" : "var(--ice)";
  const accentInk = dark ? "#000000" : "var(--ice-ink)";
  const line      = dark ? "rgba(247,246,243,.22)" : "var(--line-2)";
  const mute      = dark ? "rgba(247,246,243,.55)" : "var(--ink-mute)";
  return (
    <div className={"flex items-center "+className} aria-hidden="true">
      {Array.from({length: total}, (_,i)=>i+1).map(n=>(
        <React.Fragment key={n}>
          {n>1 && <span style={{width:24, height:1, background:line}}/>}
          <span className="rounded-full flex items-center justify-center font-mono text-[11px]"
            style={n===current
              ? {width:24, height:24, background:accent, color:accentInk}
              : {width:24, height:24, border:"1px solid "+line, color:mute}}>
            {n}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function ScreenOnboard({ step, setStep, onComplete, onProfileFetched, onAuthenticated, onLogout, sessionUserId, profile }){
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [otp, setOtp] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteMode, setInviteMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [queueUserId, setQueueUserId] = useState(null);
  const [tierSuggestion, setTierSuggestion] = useState(profile?.tier_suggestion || 1);
  const canSubmit = email.includes("@") && fullName.trim().length >= 2 && handle.trim().length >= 2 && (!inviteMode || inviteCode.trim().length >= 2);

  useEffect(() => {
    if (!resendIn) return;
    const timer = setInterval(() => setResendIn(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn > 0]);

  useEffect(() => {
    if (profile?.tier_suggestion) setTierSuggestion(profile.tier_suggestion);
  }, [profile?.tier_suggestion]);

  useEffect(() => {
    const uid = queueUserId || sessionUserId;
    if (step !== "queue" || !uid) return;
    let active = true;
    const acceptApproval = row => {
      if (!active || row?.status !== "approved") return;
      const creatorData = row.creator_data || {};
      const merged = {...row, ...creatorData, handle:creatorData.handle || row.ig_handle};
      setTierSuggestion(creatorData.tier_suggestion || 1);
      onProfileFetched(merged);
      setStep("tier-reveal");
    };
    const check = async () => {
      const {data} = await supabaseClient.from("profiles").select("*").eq("id", uid).single();
      acceptApproval(data);
    };
    const channel = supabaseClient.channel("member-approval-" + uid)
      .on("postgres_changes", {event:"UPDATE", schema:"public", table:"profiles", filter:"id=eq." + uid}, payload => acceptApproval(payload.new))
      .subscribe();
    check();
    const poll = setInterval(check, 60000);
    return () => {
      active = false;
      clearInterval(poll);
      supabaseClient.removeChannel(channel);
    };
  }, [step, queueUserId, sessionUserId]);

  const submit = async () => {
    setBusy(true);
    setErrorText("");
    const normalizedHandle = handle.trim().replace(/^@/, "");
    const { error } = await supabaseClient.auth.signInWithOtp({
      email:email.trim(),
      options:{data:{full_name:fullName.trim(), ig_handle:normalizedHandle}},
    });
    setBusy(false);
    if (error) {
      setErrorText(error.message);
      setStep('error');
      return;
    }
    setResendIn(30);
    setStep('otp');
  };

  const resend = async () => {
    if (resendIn || busy) return;
    setBusy(true);
    setErrorText("");
    const {error} = await supabaseClient.auth.signInWithOtp({
      email:email.trim(),
      options:{data:{full_name:fullName.trim(), ig_handle:handle.trim().replace(/^@/, "")}},
    });
    setBusy(false);
    if (error) { setErrorText(error.message); return; }
    setResendIn(30);
  };

  const verify = async () => {
    if (otp.length !== 6) return;
    setBusy(true);
    setErrorText("");
    const { data, error } = await supabaseClient.auth.verifyOtp({email:email.trim(), token:otp, type:"email"});
    if (error || !data.session) {
      setBusy(false);
      setErrorText(error?.message || "That code did not work");
      setStep('error');
      return;
    }
    setQueueUserId(data.user.id);
    setStep('reviewing');
    if (inviteMode) {
      const { error:inviteError } = await supabaseClient.rpc("redeem_invite", {p_code:inviteCode.trim()});
      if (inviteError) {
        setBusy(false);
        setErrorText(inviteError.message);
        setStep('error');
        return;
      }
    }
    const { data:profileRow, error:profileError } = await supabaseClient.from("profiles").select("*").eq("id", data.user.id).single();
    if (profileError) {
      setBusy(false);
      setErrorText(profileError.message);
      setStep('error');
      return;
    }
    let creatorData = profileRow.creator_data;
    if (!creatorData) {
      const creator = await supabaseClient.functions.invoke("creator-data", {body:{handle:handle.trim().replace(/^@/, "")}});
      if (creator.error) {
        setBusy(false);
        setErrorText(creator.error.message || "Could not read that profile");
        setStep('error');
        return;
      }
      creatorData = creator.data?.profile || creator.data;
      if (!creatorData) {
        setBusy(false);
        setErrorText("Could not read that profile");
        setStep('error');
        return;
      }
    }
    const mergedProfile = {...profileRow, ...(creatorData || {}), handle:creatorData?.handle || profileRow.ig_handle};
    setTierSuggestion(creatorData?.tier_suggestion || 1);
    onProfileFetched(mergedProfile);
    try {
      await onAuthenticated(data.session, mergedProfile);
    } catch (authError) {
      setBusy(false);
      setErrorText(authError.message || "Could not load your account");
      setStep('error');
      return;
    }
    setBusy(false);
    setStep(profileRow.status === "approved" ? 'tier-reveal' : 'queue');
  };

  if (step === 'intro') return (
    <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>
      <IntroVideoBG/>
      <div className="absolute inset-0 z-10 flex flex-col px-7 app-flow">
        {/* Centered wordmark lockup — serif wordmark, sentence-case copy */}
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-6">
          <div className="anim-fade" style={{fontSize:11, fontWeight:500, letterSpacing:".02em", color:"rgba(247,246,243,.78)"}}>Est. MMXXVI · Beirut</div>
          <div className="font-black font-display-l anim-up" style={{fontSize:66, lineHeight:.88, marginTop:14, textShadow:"0 2px 40px rgba(0,0,0,.6)"}}>The<br/>List</div>
          <div className="anim-up" style={{marginTop:18, fontSize:13, letterSpacing:".01em", color:"rgba(247,246,243,.82)"}}>By invitation only</div>
        </div>

        {/* Bottom actions — solid Apply (accent) + ghost invite, TSS pattern */}
        <div className="flex flex-col gap-3 anim-up">
          <button onClick={()=>{ setInviteMode(false); setStep('phone'); }} className="press glow-primary w-full h-[58px] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2.5" style={{background:"#F7F6F3", color:"#000000"}}>
            <span>Apply for access</span>
            <Icon name="arrow-right" size={16} stroke={1.6}/>
          </button>
          <button onClick={()=>{ setInviteMode(true); setStep('phone'); }} className="press w-full h-[58px] rounded-full font-medium text-[13px]" style={{background:"transparent", color:"#F7F6F3", border:"1px solid rgba(247,246,243,.32)"}}>
            I have an invite
          </button>
        </div>

        {/* Business door — venues sign in on the other side */}
        <div className="flex items-center gap-3 mt-4 anim-up" style={{opacity:.9}}>
          <div className="flex-1 h-px" style={{background:"rgba(247,246,243,.16)"}}/>
          <div className="stamp" style={{color:"rgba(247,246,243,.6)", textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>or</div>
          <div className="flex-1 h-px" style={{background:"rgba(247,246,243,.16)"}}/>
        </div>
        <button onClick={()=>{ window.location.href = "/venue"; }}
          className="press w-full h-[52px] rounded-full font-medium text-[12px] anim-up mt-3"
          style={{background:"transparent", color:"#F7F6F3", border:"1px solid rgba(247,246,243,.32)"}}>
          List your venue · Business
        </button>
        <a href="?demo=1" className="press flex items-center justify-center h-11 mt-3 text-[12px]" style={{color:"#F7F6F3"}}>Explore the demo</a>
      </div>
    </div>
  );

  if (step === 'phone') return (
    <div className="absolute inset-0 anim-fade" style={{background:"var(--bg)"}}>
      <div className="absolute inset-0 flex flex-col px-7 app-flow">
        <button onClick={()=>setStep("intro")} aria-label="Back" className="press w-11 h-11 mb-3 flex items-center justify-center self-start"><Icon name="arrow-left" size={18}/></button>
        <div className="stamp wordmark">The List</div>
        <Steps current={1} className="mt-4"/>
        <div className="font-black font-display-l text-[44px] leading-[.95] mt-3">Apply</div>
        <div className="text-[13px] mt-3 max-w-[280px]" style={{color:"var(--ink-2)"}}>By invitation only. We review every profile manually. Approval typically takes 24 hours.</div>

        <div className="mt-10 space-y-5">
          <div>
            <div className="stamp mb-2">Email</div>
            <input type="email" aria-label="Email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 px-3 rounded-[12px] text-[16px]" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}/>
          </div>
          <div>
            <div className="stamp mb-2">Full name</div>
            <input aria-label="Full name" autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Sara Capriotti" className="w-full h-12 px-3 rounded-[12px] text-[16px]" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}/>
          </div>
          {inviteMode && <div>
            <div className="stamp mb-2">Invite code</div>
            <input aria-label="Invite code" autoCapitalize="characters" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} placeholder="LST-XX" className="w-full h-12 px-3 rounded-[12px] text-[16px]" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}/>
          </div>}
          <div>
            <div className="stamp mb-2">Instagram handle</div>
            <div className="flex h-12 rounded-[12px] overflow-hidden" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)"}}>
              <div className="px-3 flex items-center text-[16px]" style={{color:"var(--ink-mute)"}}>@</div>
              <input aria-label="Instagram handle" autoCapitalize="none" autoCorrect="off" value={handle} onChange={e=>setHandle(e.target.value)} placeholder="capriottisara" className="flex-1 min-w-0 bg-transparent text-[16px] pr-3 focus:outline-none" style={{color:"var(--ink)"}}/>
            </div>
          </div>
        </div>

        <div className="flex-1"/>

        <button onClick={submit} disabled={!canSubmit || busy} className={"press w-full h-[58px] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2.5 "+(canSubmit?"glow-primary":"")} style={{background: canSubmit ? "var(--ice)" : "var(--bg-elev2)", color: canSubmit ? "var(--ice-ink)" : "var(--ink-mute)"}}>
          <span>{busy ? "Sending code" : "Apply for access"}</span>
          <Icon name="arrow-right" size={16} stroke={1.6}/>
        </button>
        <div className="text-center text-[11px] mt-3" style={{color:"var(--ink-mute)"}}>No password. We send a six-digit email code.</div>
      </div>
    </div>
  );

  if (step === 'otp') return (
    <div className="absolute inset-0 anim-fade" style={{background:"var(--bg)"}}>
      <div className="absolute inset-0 flex flex-col px-7 app-flow">
        <button onClick={()=>setStep("phone")} aria-label="Back" className="press w-11 h-11 mb-3 flex items-center justify-center self-start"><Icon name="arrow-left" size={18}/></button>
        <div className="stamp wordmark">The List · verification</div>
        <Steps current={2} className="mt-4"/>
        <div className="font-black font-display-l text-[44px] leading-[.95] mt-3">Check<br/>your email</div>
        <div className="text-[13px] mt-3 max-w-[280px]" style={{color:"var(--ink-2)"}}>Enter the six-digit code sent to {email}.</div>
        <input aria-label="Email verification code" autoComplete="one-time-code" inputMode="numeric" maxLength="6" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="w-full h-14 px-4 rounded-[12px] text-[24px] tracking-[.3em] mt-10" style={{background:"var(--bg-elev)", border:"1px solid var(--line-2)", color:"var(--ink)"}}/>
        <button onClick={resend} disabled={resendIn > 0 || busy} className="press h-11 px-3 self-center mt-3 text-[12px]" style={{color:"var(--ink)"}}>
          {resendIn > 0 ? "Resend code in " + resendIn + "s" : "Resend code"}
        </button>
        <div className="flex-1"/>
        <button onClick={verify} disabled={otp.length !== 6 || busy} className={"press w-full h-[58px] rounded-full font-semibold text-[15px] "+(otp.length === 6 ? "glow-primary" : "")} style={{background:otp.length === 6 ? "var(--ice)" : "var(--bg-elev2)", color:otp.length === 6 ? "var(--ice-ink)" : "var(--ink)"}}>
          {busy ? "Reading profile" : "Verify code"}
        </button>
      </div>
    </div>
  );

  if (step === 'reviewing') return (
    <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>
      <div className="absolute app-top-controls left-0 right-0 flex justify-center">
        <Steps current={2} dark/>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7">
        <div className="w-[160px] h-[160px] rounded-full border-2 flex items-center justify-center" style={{borderColor:"rgba(247,246,243,.2)"}}>
          <div className="w-[120px] h-[120px] rounded-full border-2 spin" style={{borderColor:"rgba(247,246,243,.3)", borderTopColor:"#F7F6F3"}}/>
        </div>
        <div className="font-black font-display-l text-[28px] mt-10">Reading</div>
        <div className="text-[13px] mt-3 max-w-[260px]">Pulling @{handle || "your-handle"}'s reach, demographics, and engagement.</div>
      </div>
    </div>
  );

  if (step === 'queue') return (
    <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7">
        <div className="font-black font-display-l text-[38px] leading-[.95]">You're on<br/>the queue</div>
        <div className="text-[13px] mt-4 max-w-[280px]">We review every application. You'll get access as soon as your profile is approved.</div>
        <button onClick={onLogout} className="press h-11 px-5 rounded-full mt-8 text-[12px]" style={{border:"1px solid rgba(247,246,243,.28)", color:"#F7F6F3"}}>Log out</button>
      </div>
    </div>
  );

  if (step === 'error') return (
    <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>
      <div className="absolute inset-0 flex flex-col px-7 app-flow">
        <div className="stamp wordmark" style={{color:"#F7F6F3", textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>The List · No. 048</div>
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{border:"2px solid rgba(247,246,243,.25)", color:"rgba(247,246,243,.85)"}}>
            <Icon name="x" size={40} stroke={1.4}/>
          </div>
          <div className="font-black font-display-l text-[30px] leading-[.95] mt-10">Couldn't<br/>read that</div>
          <div className="text-[13px] mt-3 opacity-75 max-w-[280px]">{errorText || "Check your details and try again."}</div>
        </div>
        <button onClick={()=>setStep('phone')} className="press glow-primary w-full h-[58px] rounded-full font-semibold text-[15px]" style={{background:"#F7F6F3", color:"#000000"}}>
          Try another handle
        </button>
      </div>
    </div>
  );

  // tier-reveal
  return (
    <div className="absolute inset-0 anim-fade" style={{background:"#000000", color:"#F7F6F3"}}>
      <div className="absolute inset-0 flex flex-col px-7 app-flow">
        <div className="stamp wordmark picked-stagger" style={{color:"#F7F6F3", textShadow:"0 1px 8px rgba(0,0,0,.5)", animationDelay:"0ms"}}>The List · invitation</div>
        <Steps current={3} dark className="mt-4 picked-stagger"/>

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="ring-pop w-[180px] h-[180px] rounded-full flex items-center justify-center" style={{border:"2px solid #F7F6F3", color:"#F7F6F3", animationDelay:"120ms", boxShadow:"inset 0 0 0 7px rgba(247,246,243,.12)"}}>
            <div className="font-black text-[36px] leading-none">Tier<br/>{["One","Two","Three","Four"][Math.max(0, Number(tierSuggestion || 1)-1)] || tierSuggestion}</div>
          </div>
          <div className="font-black font-display-l text-[34px] leading-[.95] mt-10 picked-stagger" style={{animationDelay:"680ms"}}>Listed</div>
          <div className="text-[13px] mt-3 opacity-80 max-w-[280px] picked-stagger" style={{animationDelay:"820ms"}}>Your audience fits the rooms. Tier reviews happen quarterly.</div>
        </div>

        <button onClick={onComplete} className="press glow-primary w-full h-[58px] rounded-full font-semibold text-[15px] flex items-center justify-center gap-2.5 picked-stagger" style={{background:"#F7F6F3", color:"#000000", animationDelay:"1100ms"}}>
          <span>Enter The List</span>
          <Icon name="arrow-right" size={16} stroke={1.6}/>
        </button>
      </div>
    </div>
  );
}

/* ========== genCode — LST-XX where XX = 2 uppercase alphanum, no collision ========== */
function genCode(existing){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/1/0 lookalikes
  const used = new Set((existing || []).map(r => r.code).filter(Boolean));
  let code;
  do {
    code = "LST-" + chars[Math.floor(Math.random()*chars.length)] + chars[Math.floor(Math.random()*chars.length)];
  } while (used.has(code));
  return code;
}

/* ========== APP — navigation state ========== */
function App(){
  useEffect(() => {
    // ponytail: use the visible viewport so iOS keyboards cannot cover app sheets.
    const viewport = window.visualViewport;
    const resize = () => {
      if (viewport && viewport.scale !== 1) return;
      document.documentElement.style.setProperty("--app-height", `${viewport?.height || window.innerHeight}px`);
      document.documentElement.style.setProperty("--app-offset", `${viewport?.offsetTop || 0}px`);
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);
  const [onboardStep, setOnboardStep] = useState(DEMO_PREVIEW ? "done" : "intro"); // intro | phone | otp | reviewing | queue | tier-reveal | error | done
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [screen, setScreen] = useState(DEMO_PREVIEW ? "profile" : "home"); // home | explore | detail | mylist | profile | picked
  const [tab, setTab] = useState(DEMO_PREVIEW ? "profile" : "home");
  const [currentEvent, setCurrentEvent] = useState(null);
  const currentEventRef = useRef(currentEvent);
  currentEventRef.current = currentEvent;
  const [applyState, setApplyState] = useState("idle");   // idle | submitting | submitted
  const [pickedEventId, setPickedEventId] = useState(null); // which event the picked takeover shows
  const [passEventId, setPassEventId] = useState(null);     // which event's pass is open (null = closed)
  const [storyEventId, setStoryEventId] = useState(null);   // which event's story sheet is open (null = closed)
  const [mylistSeg, setMylistSeg] = useState(null);          // segment My Events should open on (deep-link hint)
  const [myEvents, setMyEvents] = useState(MY_EVENTS);   // member's event relationships
  const myEventsRef = useRef(myEvents);
  myEventsRef.current = myEvents; // Timed demo picks must read the latest relationship state.
  const [notifs, setNotifs] = useState(SEED_NOTIFS);     // member's notification feed
  const [light, setLight] = useState(false);
  const [profile, setProfile] = useState(DEMO_PREVIEW ? SEED_PROFILE : null); // creator-data provider response (vendor-neutral)
  const [saved, setSaved] = useState([]);             // saved / bookmarked event ids
  const [shareEvent, setShareEvent] = useState(null); // event being shared (null = sheet closed)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);  // Activity sheet (bell on Home)
  const [memberRecord, setMemberRecord] = useState(null);
  const [memberRecordLoading, setMemberRecordLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [syncNotice, setSyncNotice] = useState(null);
  const toastTimer = useRef(null);
  // Timer refs — apply delay + per-event pick timers + story verdict timers (maps: eventId → timeoutId)
  const applyTimerRef = useRef(null);
  const pickTimersRef = useRef({});
  const verdictTimersRef = useRef({});
  const pickActionRef = useRef(false);

  const hydrateMember = async (uid, gate=false) => {
    const [profileResult, eventResult, applicationResult, saveResult, notificationResult, eventStatsResult] = await Promise.all([
      supabaseClient.from("profiles").select("*").eq("id", uid).single(),
      supabaseClient.from("events").select("*, venues(name,area,ig_handle)").in("status", ["published","locked","closed"]).order("starts_at", {ascending:true}),
      supabaseClient.from("applications").select("*, events(*, venues(name,area,ig_handle))").eq("member_id", uid),
      supabaseClient.from("saves").select("*"),
      supabaseClient.from("notifications").select("*").order("created_at", {ascending:false}),
      supabaseClient.rpc("event_stats"),
    ]);
    const firstError = [profileResult, eventResult, applicationResult, saveResult, notificationResult, eventStatsResult].find(result => result.error)?.error;
    if (firstError) throw firstError;

    const applications = applicationResult.data || [];
    const appIds = applications.map(row => row.id);
    let stories = [];
    if (appIds.length) {
      const storyResult = await supabaseClient.from("stories").select("*").in("application_id", appIds);
      if (storyResult.error) throw storyResult.error;
      stories = storyResult.data || [];
    }
    const storyByApplication = new Map(stories.map(story => [story.application_id, story]));
    const statsByEvent = new Map((eventStatsResult.data || []).map(row => [row.event_id, row]));
    const withStats = row => ({...row, ...(statsByEvent.get(row.id) || {})});
    const liveEvents = (eventResult.data || []).map(row => normalizeEvent(withStats(row)));
    const knownIds = new Set(liveEvents.map(event => event.id));
    applications.forEach(application => {
      if (application.events && !knownIds.has(application.events.id)) {
        liveEvents.push(normalizeEvent(withStats(application.events)));
        knownIds.add(application.events.id);
      }
    });
    const profileRow = profileResult.data;
    const creatorData = profileRow.creator_data || {};
    const liveProfile = {
      ...creatorData,
      ...profileRow,
      full_name:profileRow.full_name || creatorData.full_name,
      handle:profileRow.ig_handle || creatorData.handle,
      profile_picture_url:profileRow.avatar_url || creatorData.profile_picture_url,
    };
    setProfile(liveProfile);
    setEvents(liveEvents);
    setMyEvents(applications.map(row => mapApplication(row, storyByApplication.get(row.id))));
    setSaved((saveResult.data || []).map(row => row.event_id));
    setNotifs((notificationResult.data || []).map(mapNotification));
    setMemberRecord(null);
    setSyncNotice(null);
    if (gate) setOnboardStep(profileRow.status === "approved" ? "done" : "queue");
    try {
      const pendingId = sessionStorage.getItem("pending-event");
      const pendingEvent = pendingId ? liveEvents.find(event => String(event.id) === String(pendingId)) : null;
      if (pendingId) sessionStorage.removeItem("pending-event");
      if (pendingEvent) {
        setCurrentEvent(pendingEvent);
        setTab("explore");
        setScreen("detail");
      }
    } catch (e) {}
    return profileRow;
  };

  // A failed read must not undo a mutation already accepted by the server.
  const refreshAfterMutation = async (savedMessage) => {
    try {
      await hydrateMember(session.user.id);
      return true;
    } catch (error) {
      setSyncNotice(savedMessage);
      return false;
    }
  };

  const loadMemberRecord = async () => {
    if (!session || memberRecordLoading) return null;
    setMemberRecordLoading(true);
    const {data, error} = await supabaseClient.rpc("member_record");
    setMemberRecordLoading(false);
    if (error) { showToast(error.message); return null; }
    setMemberRecord(data || {});
    return data;
  };

  const completeAuth = async (nextSession) => {
    setSession(nextSession);
    try {
      await hydrateMember(nextSession.user.id);
    } catch (error) {
      showToast(error.message || "Could not load your account");
      throw error;
    }
  };

  const resetToIntro = () => {
    setSession(null);
    setProfile(null);
    setEvents(SEED_EVENTS);
    setMyEvents(MY_EVENTS);
    setNotifs(SEED_NOTIFS);
    setSaved([]);
    setMemberRecord(null);
    setMemberRecordLoading(false);
    setCurrentEvent(null);
    setPickedEventId(null);
    setPassEventId(null);
    setStoryEventId(null);
    setShareEvent(null);
    setSettingsOpen(false);
    setNotifOpen(false);
    setApplyState("idle");
    setSyncNotice(null);
    setScreen("home");
    setTab("home");
    setOnboardStep("intro");
  };

  const logout = async () => {
    const {error} = await supabaseClient.auth.signOut();
    if (error) { showToast(error.message); return false; }
    resetToIntro();
    return true;
  };

  const deleteAccount = async () => {
    if (!session) return false;
    const {error} = await supabaseClient.rpc("delete_account");
    if (error) { showToast(error.message); return false; }
    const {error:signOutError} = await supabaseClient.auth.signOut();
    if (signOutError) { showToast(signOutError.message); return false; }
    resetToIntro();
    return true;
  };

  const saveSettings = async ({name, handle, phone, notifPicks, notifDrops}) => {
    if (!session) return false;
    if (!name || !handle) { showToast("Name and Instagram handle are required"); return false; }
    const previousHandle = String(profile?.ig_handle || profile?.handle || "").replace(/^@/, "");
    const {error} = await supabaseClient.from("profiles").update({
      full_name:name,
      ig_handle:handle,
      phone:phone || null,
      notif_picks:notifPicks,
      notif_drops:notifDrops,
    }).eq("id", session.user.id);
    if (error) { showToast(error.message); return false; }
    if (handle !== previousHandle) {
      const refresh = await supabaseClient.functions.invoke("creator-data", {body:{handle}});
      if (refresh.error) showToast("Profile saved. Instagram data will refresh later.");
    }
    await hydrateMember(session.user.id);
    showToast("Settings saved");
    return true;
  };

  // Cleanup all pending timers on unmount
  useEffect(() => {
    return () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
      Object.values(pickTimersRef.current).forEach(id => clearTimeout(id));
      Object.values(verdictTimersRef.current).forEach(id => clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (DEMO_PREVIEW) return;
    supabaseClient.auth.getSession().then(async ({data}) => {
      if (!data.session) return;
      setSession(data.session);
      try { await hydrateMember(data.session.user.id, true); }
      catch (error) {
        setOnboardStep("error");
        showToast(error.message || "Could not load your account");
      }
    });
  }, []);

  useEffect(() => {
    if (!session) return;
    const channel = supabaseClient.channel("member-notifications-" + session.user.id)
      .on("postgres_changes", {event:"INSERT", schema:"public", table:"notifications", filter:"user_id=eq." + session.user.id}, payload => {
        setNotifs(current => [mapNotification(payload.new), ...current]);
        // a notification always means server state moved — refresh so statuses stay truthful
        hydrateMember(session.user.id).catch(() => {});
      })
      .subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [session?.user?.id]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', light);
  }, [light]);

  const goTab = (id) => {
    setTab(id);
    if (id === "home")    setScreen("home");
    if (id === "explore") setScreen("explore");
    if (id === "mylist")  setScreen("mylist");
    if (id === "profile") setScreen("profile");
    setApplyState("idle");
    setMylistSeg(null); // deep-link hint is one-shot — normal tab taps get the default segment
  };

  const pickEvent = (e) => {
    currentEventRef.current = e;
    setCurrentEvent(e);
    setApplyState("idle");
    setScreen("detail");
  };

  // simulatePick — flip a myEvents row to picked + prepend a picked notif
  // Available to T16 switchboard via prop drilling or window.simulatePick
  function simulatePick(eventId) {
    const ev = eventById(eventId, events);
    if (!ev || myEventsRef.current.find(row => row.eventId === eventId)?.state !== GS.applied) return false;
    clearTimeout(pickTimersRef.current[eventId]);
    delete pickTimersRef.current[eventId];
    const now = Date.now();
    myEventsRef.current = myEventsRef.current.map(row => row.eventId === eventId ? {...row, state:GS.picked, pickedAt:now} : row);
    setMyEvents(myEventsRef.current);
    setNotifs(prev => [{
      id: "expire-" + eventId + "-" + now,
      kind: "expiring",
      text: "Confirm your seat — 2h left · " + ev.title,
      eventId,
      read: false,
    }, {
      id: "pick-" + eventId + "-" + now,
      kind: "picked",
      text: "Cyan Beach Club picked you · " + ev.title,
      eventId,
      read: false,
    }, ...prev]);
    return true;
  }

  const onApply = async () => {
    if (!activeEvent || applyState === "submitting") return;
    const eventId = activeEvent.id;
    if (session) {
      setApplyState("submitting");
      let submitted = false;
      try {
        const {data, error} = await supabaseClient.rpc("apply_to_event", {p_event:eventId});
        if (error) throw error;
        submitted = true;
        const state = data === "waitlist" ? GS.waitlist : GS.applied;
        setMyEvents(current => current.some(row => row.eventId === eventId)
          ? current.map(row => row.eventId === eventId ? {...row, state} : row)
          : [...current, {eventId, state}]);
        const message = data === "waitlist" ? "Still under review" : "Application sent";
        showToast(message);
        await refreshAfterMutation(message);
      } catch (error) {
        showToast(error.message || "Could not send your application. Try again.");
      } finally {
        if (currentEventRef.current?.id === eventId) setApplyState(submitted ? "submitted" : "idle");
      }
      return;
    }
    // Clear any existing apply timer
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    // Clear any existing pick timer for this event
    if (pickTimersRef.current[eventId]) {
      clearTimeout(pickTimersRef.current[eventId]);
      delete pickTimersRef.current[eventId];
    }
    setApplyState("submitting");
    applyTimerRef.current = setTimeout(() => {
      applyTimerRef.current = null;
      // Upsert the applied row — no duplicates
      setMyEvents(prev => {
        const exists = prev.find(r => r.eventId === eventId);
        if (exists) {
          return prev.map(r => r.eventId === eventId ? { ...r, state: GS.applied } : r);
        }
        return [...prev, { eventId, state: GS.applied }];
      });
      if (currentEventRef.current?.id === eventId) setApplyState("submitted");
      showToast("Application sent");
      // Auto-arm: 10s after apply, simulatePick fires
      pickTimersRef.current[eventId] = setTimeout(() => {
        delete pickTimersRef.current[eventId];
        simulatePick(eventId);
      }, 10000);
    }, 1400);
  };

  const onCancelApplication = async (row) => {
    if (!session) {
      clearTimeout(pickTimersRef.current[row?.eventId]);
      delete pickTimersRef.current[row?.eventId];
      myEventsRef.current = myEventsRef.current.filter(item => item.eventId !== row?.eventId);
      setMyEvents(myEventsRef.current);
      setApplyState("idle");
      showToast("Application cancelled");
      return;
    }
    if (!row?.applicationId) { showToast("Refresh your application before cancelling"); return; }
    try {
      const {error} = await supabaseClient.rpc("cancel_application", {p_app:row.applicationId});
      if (error) throw error;
      setMyEvents(current => current.map(item => item.eventId === row.eventId ? {...item, state:GS.withdrawn} : item));
      setApplyState("idle");
      showToast("Application cancelled");
      await refreshAfterMutation("Application cancelled");
    } catch (error) {
      showToast(error.message || "Could not cancel your application. Try again.");
    }
  };

  // forceVerdict — settle a story review. Default path is verified; the
  // switchboard (T16) can force needs_review / rejected. Mirrors the rubric
  // shape the backend will return: { verdict, score, reason }.
  function forceVerdict(eventId, v) {
    const ev = eventById(eventId, events);
    if (!ev) return;
    const outcomes = {
      [SS.verified]:    { score: 91, reason: "Tag visible, posted in window" },
      [SS.needsReview]: { score: 64, reason: "Our team takes a second look" },
      [SS.rejected]:    { score: 32, reason: "Tag not visible — try another screenshot" },
    };
    const verdict = outcomes[v];
    if (!verdict) return;
    setMyEvents(prev => prev.map(r => r.eventId === eventId ? { ...r, story: v, verdict } : r));
    if (v === SS.verified) {
      setNotifs(prev => [{ id: "story-" + eventId + "-" + Date.now(), kind: "story",
        text: "Story verified · " + ev.title, eventId, read: false }, ...prev]);
      showToast("Verified ✓ · " + verdict.reason);
    } else if (v === SS.needsReview) {
      showToast("Needs review · " + verdict.reason);
    } else {
      showToast(SS_COPY[SS.rejected]);
    }
  }

  // Live proof is uploaded and stays pending for founder/Gemini review.
  // Demo keeps the eight-second simulated verdict.
  const submitStory = async (eventId, dataUrl) => {
    if (session) {
      const row = myEvents.find(item => item.eventId === eventId);
      if (!row?.applicationId) { showToast("Could not find this invitation"); return false; }
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const path = session.user.id + "/story-" + row.applicationId + ".jpg";
        const {error:uploadError} = await supabaseClient.storage.from("media").upload(path, blob, {
          upsert:true,
          contentType:blob.type || "image/jpeg",
        });
        if (uploadError) throw uploadError;
        const publicUrl = supabaseClient.storage.from("media").getPublicUrl(path).data.publicUrl;
        const {error:submitError} = await supabaseClient.rpc("submit_story", {p_app:row.applicationId, p_media:publicUrl});
        if (submitError) throw submitError;
        await hydrateMember(session.user.id);
        setStoryEventId(null);
        showToast("Under review · we check within a few hours");
        return true;
      } catch (error) {
        showToast(error.message || "Could not upload your Story");
        return false;
      }
    }
    setMyEvents(prev => prev.map(r => r.eventId === eventId ? { ...r, story: SS.review, verdict: undefined } : r));
    setStoryEventId(null);
    showToast("Under review · we check within a few hours");
    if (verdictTimersRef.current[eventId]) clearTimeout(verdictTimersRef.current[eventId]);
    verdictTimersRef.current[eventId] = setTimeout(() => {
      delete verdictTimersRef.current[eventId];
      forceVerdict(eventId, SS.verified);
    }, 8000);
    return true;
  };

  // Open the pass (ticket) for a confirmed/checked-in event
  const openPass = (eventId) => {
    const row = myEvents.find(r => r.eventId === eventId);
    if (!row || (row.state !== GS.confirmed && row.state !== GS.checkedIn)) return;
    setPassEventId(eventId);
  };

  // ---- Demo switchboard actions (T16) — the rig behind Settings › Demo ----
  const demoActions = {
    pickNow: () => { showToast(simulatePick("lounge") ? "Picked · check the bell" : "Apply to Late Lounge first"); },
    expirePick: () => {
      const row = myEvents.find(r => r.state === GS.picked);
      if (!row) { showToast("No pick to expire — apply first"); return; }
      setMyEvents(prev => prev.map(r => r.eventId === row.eventId ? { ...r, state: GS.expired, pickedAt: undefined } : r));
      const ev = eventById(row.eventId, events);
      setNotifs(prev => [{ id: "expired-" + row.eventId + "-" + Date.now(), kind: "expiring",
        text: "Pick expired · " + (ev ? ev.title : ""), eventId: row.eventId, read: false }, ...prev]);
    },
    checkIn: () => {
      setMyEvents(prev => prev.map(r => r.eventId === "pool" && r.state === GS.confirmed ? { ...r, state: GS.checkedIn, inAt: "22:41" } : r));
      showToast("Checked in · Pool Day");
    },
    verdict: (v) => forceVerdict("bath", v),
    reset: () => {
      Object.values(pickTimersRef.current).forEach(id => clearTimeout(id));
      Object.values(verdictTimersRef.current).forEach(id => clearTimeout(id));
      pickTimersRef.current = {}; verdictTimersRef.current = {};
      setMyEvents(MY_EVENTS); setNotifs(SEED_NOTIFS); setSaved([]);
      setApplyState("idle"); setPassEventId(null); setStoryEventId(null); setPickedEventId(null);
      setSettingsOpen(false);
      showToast("Demo reset");
    },
  };

  // notifTarget — every Activity row deep-links somewhere real (T15).
  // Falls back to Event Detail / My Events when the state has moved on.
  function notifTarget(n) {
    closeNotifs();
    const ev = n.eventId ? eventById(n.eventId, events) : null;
    const row = n.eventId ? myEvents.find(r => r.eventId === n.eventId) : null;
    switch (n.kind) {
      case "picked":
      case "expiring":
        if (row && row.state === GS.picked) { openPickedTakeover(n.eventId); return; }
        break;
      case "pass":
        if (row && (row.state === GS.confirmed || row.state === GS.checkedIn)) { openPass(n.eventId); return; }
        break;
      case "story":
        if (row && (row.story === SS.due || row.story === SS.rejected)) { setStoryEventId(n.eventId); return; }
        setMylistSeg("past"); setScreen("mylist"); setTab("mylist"); return;
      case "cancelled":
        setMylistSeg("past"); setScreen("mylist"); setTab("mylist"); return;
    }
    if (ev) pickEvent(ev); // drop + all fallbacks → Event Detail
  }

  // Closing the Activity sheet marks everything read — the badge never goes stale
  const closeNotifs = async () => {
    const unreadIds = notifs.filter(n => !n.read).map(n => n.id);
    setNotifOpen(false);
    setNotifs(prev => prev.some(n => !n.read) ? prev.map(n => n.read ? n : { ...n, read: true }) : prev);
    if (session && unreadIds.length) {
      await supabaseClient.from("notifications").update({read:true}).in("id", unreadIds).eq("user_id", session.user.id);
    }
  };

  // Open the picked takeover for a given eventId
  const openPickedTakeover = (eventId) => {
    const ev = eventById(eventId, events);
    if (!ev) return;
    setCurrentEvent(ev);
    setPickedEventId(eventId);
    setScreen("picked");
  };

  const onConfirmPick = async () => {
    if (!pickedEventId || pickActionRef.current) return;
    if (session) {
      const row = myEvents.find(item => item.eventId === pickedEventId);
      if (!row?.applicationId) { showToast("Refresh your invitation before confirming"); return; }
      pickActionRef.current = true;
      try {
        const {error} = await supabaseClient.rpc("confirm_pick", {p_app:row.applicationId});
        if (error) throw error;
        setMyEvents(current => current.map(item => item.eventId === pickedEventId ? {...item, state:GS.confirmed, pickedAt:undefined} : item));
        showToast("Seat confirmed");
        setPickedEventId(null); setScreen("mylist"); setTab("mylist");
        await refreshAfterMutation("Seat confirmed");
      } catch (error) {
        showToast(error.message || "Could not confirm your seat. Try again.");
      } finally {
        pickActionRef.current = false;
      }
      return;
    }
    setMyEvents(prev => {
      const code = genCode(prev);
      const exists = prev.find(r => r.eventId === pickedEventId);
      if (exists) {
        return prev.map(r => r.eventId === pickedEventId ? { ...r, state: GS.confirmed, code, pickedAt: undefined } : r);
      }
      return [...prev, { eventId: pickedEventId, state: GS.confirmed, code }];
    });
    showToast("You're in — pass ready");
    setPickedEventId(null);
    setScreen("mylist");
    setTab("mylist");
  };

  const onDeclinePick = async () => {
    if (!pickedEventId || pickActionRef.current) return;
    if (session) {
      const row = myEvents.find(item => item.eventId === pickedEventId);
      if (!row?.applicationId) { showToast("Refresh your invitation before declining"); return; }
      pickActionRef.current = true;
      try {
        const {error} = await supabaseClient.rpc("decline_pick", {p_app:row.applicationId});
        if (error) throw error;
        setMyEvents(current => current.map(item => item.eventId === pickedEventId ? {...item, state:GS.declined, pickedAt:undefined} : item));
        showToast("Seat released");
        setPickedEventId(null); setScreen(tab === "explore" ? "explore" : "home");
        await refreshAfterMutation("Seat released");
      } catch (error) {
        showToast(error.message || "Could not release your seat. Try again.");
      } finally {
        pickActionRef.current = false;
      }
      return;
    }
    setMyEvents(prev => {
      const exists = prev.find(r => r.eventId === pickedEventId);
      if (exists) {
        return prev.map(r => r.eventId === pickedEventId ? { ...r, state: GS.declined, pickedAt: undefined } : r);
      }
      return [...prev, { eventId: pickedEventId, state: GS.declined }];
    });
    showToast("Seat released");
    const prevScreen = tab === "explore" ? "explore" : "home";
    setPickedEventId(null);
    setScreen(prevScreen);
  };

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const toggleSave = async (id) => {
    const wasSaved = saved.includes(id);
    if (session) {
      const {error} = await supabaseClient.rpc("toggle_save", {p_event:id});
      if (error) { showToast(error.message); return; }
      setSaved(current => wasSaved ? current.filter(eventId => eventId !== id) : [...current, id]);
      showToast(wasSaved ? "Removed from saved" : "Saved to your list");
      return;
    }
    setSaved(s => wasSaved ? s.filter(x => x !== id) : [...s, id]);
    showToast(wasSaved ? "Removed from saved" : "Saved to your list");
  };

  // Verify-with-Instagram: flips the (vendor-neutral) creator data to verified.
  const onVerify = () => {
    if (session) {
      showToast("Instagram connection is not enabled yet");
      return;
    }
    setProfile(p => ({
      ...(p || SEED_PROFILE),
      data_status: "verified",
      fetched_at: new Date().toISOString(),
    }));
    setSettingsOpen(false);
    showToast("Instagram connected · verified");
  };

  const savedEvents = useMemo(() => events.filter(e => saved.includes(e.id)), [events, saved]);
  const activeEvent = currentEvent
    ? events.find(event => event.id === currentEvent.id) || (!session ? currentEvent : null)
    : null;

  const finishOnboarding = () => setOnboardStep("done");
  const onboardActive = onboardStep !== "done";

  // Derive pickedAt for the currently-shown picked event
  const pickedRow = pickedEventId ? myEvents.find(r => r.eventId === pickedEventId) : null;
  const pickedAt = pickedRow ? pickedRow.pickedAt : null;
  const pickExpiresAt = pickedRow ? pickedRow.pickExpiresAt : null;

  // Unread notif count for badge
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <main className="app-shell" aria-label="The List member app">
      <div className="app-frame">
        <div className="app-surface">
          {onboardActive && <ScreenOnboard step={onboardStep} setStep={setOnboardStep} onComplete={finishOnboarding} onProfileFetched={setProfile} onAuthenticated={completeAuth} onLogout={logout} sessionUserId={session?.user?.id} profile={profile}/>}
          {!onboardActive && screen === "home"    && <ScreenHome    tab={tab} onTab={goTab} onPickEvent={pickEvent} saved={saved} onToggleSave={toggleSave} myEvents={myEvents} onBell={()=>setNotifOpen(true)} unreadCount={unreadCount} onOpenPass={openPass} events={events} live={!!session}/>}
          {!onboardActive && screen === "explore" && <ScreenExplore tab={tab} onTab={goTab} onPickEvent={pickEvent} saved={saved} onToggleSave={toggleSave} onToast={showToast} events={events} live={!!session}/>}
          {!onboardActive && screen === "detail"  && <ScreenEventDetail event={activeEvent} applyState={applyState} onBack={()=>setScreen(tab==="explore"?"explore":"home")} onApply={onApply} onCancel={onCancelApplication} onShare={()=>setShareEvent(activeEvent)} saved={saved} onToggleSave={toggleSave} onToast={showToast} myEvents={myEvents} onOpenPicked={openPickedTakeover} onOpenPass={openPass} live={!!session}/>}
          {!onboardActive && screen === "mylist"  && <ScreenMyEvents tab={tab} onTab={goTab} myEvents={myEvents} savedEvents={savedEvents} onToggleSave={toggleSave} onPickEvent={pickEvent} onToast={showToast} onOpenPass={openPass} onOpenPicked={openPickedTakeover} onOpenStory={setStoryEventId} initialSeg={mylistSeg} events={events}/>}
          {!onboardActive && screen === "profile" && <ScreenProfile tab={tab} onTab={goTab} profile={profile} onSettings={()=>setSettingsOpen(true)} onVerify={onVerify} live={!!session} memberRecord={memberRecord} memberRecordLoading={memberRecordLoading} onLoadRecord={loadMemberRecord}/>}
          {!onboardActive && screen === "picked"  && <ScreenPicked event={activeEvent} pickedAt={pickedAt} pickExpiresAt={pickExpiresAt} onConfirm={onConfirmPick} onDecline={onDeclinePick} live={!!session}/>}

          {/* Pass — full-screen overlay above screens, below sheets */}
          {!onboardActive && passEventId && (
            <ScreenPass event={eventById(passEventId, events)}
                        row={myEvents.find(r => r.eventId === passEventId)}
                        profile={profile}
                        live={!!session}
                        onRefresh={()=>session ? hydrateMember(session.user.id).catch(error=>showToast(error.message)) : null}
                        onBack={()=>setPassEventId(null)}/>
          )}

          {/* Overlays — scoped to the app viewport */}
          {!onboardActive && storyEventId && <StorySheet event={eventById(storyEventId, events)} onClose={()=>setStoryEventId(null)} onSubmit={(shot)=>submitStory(storyEventId, shot)}/>}
          {!onboardActive && <ShareSheet event={shareEvent} onClose={()=>setShareEvent(null)} onToast={showToast}/>}
          {!onboardActive && settingsOpen && <SettingsSheet profile={profile} light={light} setLight={setLight} onClose={()=>setSettingsOpen(false)} onToast={showToast} demo={session ? null : demoActions} live={!!session} onSave={saveSettings} onLogout={logout} onDelete={deleteAccount}/>}
          {!onboardActive && notifOpen && <NotificationsSheet notifs={notifs} onClose={closeNotifs} onTarget={notifTarget}/>}
          {syncNotice && <div role="status" className="absolute app-top-controls left-3 right-3 z-[60] glass rounded-[14px] px-4 py-2 flex items-center gap-3">
            <div className="flex-1 text-[12px]">{syncNotice}. Updates are delayed.</div>
            <button onClick={()=>refreshAfterMutation(syncNotice)} className="press h-11 px-3 text-[12px] font-semibold">Retry refresh</button>
          </div>}
          <Toast msg={toast}/>
        </div>
      </div>

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
