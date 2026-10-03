// One member score for the member Profile, the venue screens and both demos, so every screen shows
// the same number. Input: counts from the member_records database function (or demo data with the
// same keys). Returns the score out of 10 (null until there is data) and the parts behind it.
// ponytail: equal weights for showing up, Stories and venue rating; tune once real nights exist.
export function memberScore(record) {
  const share = (good, bad) => {
    const yes = Number(record?.[good]) || 0, no = Number(record?.[bad]) || 0;
    return yes + no > 0 ? yes / (yes + no) : null;
  };
  const showUp = share("attended", "no_shows");
  const stories = share("stories_verified", "stories_missed");
  const raw = record?.avg_rating;
  const rating = raw == null || raw === "" || !Number.isFinite(Number(raw)) ? null : Number(raw);
  const parts = [showUp, stories].filter(part => part != null).map(part => part * 10);
  if (rating != null) parts.push(rating);
  const score = parts.length ? Math.round(parts.reduce((sum, part) => sum + part, 0) / parts.length * 10) / 10 : null;
  return { score, showUp, stories, rating };
}
