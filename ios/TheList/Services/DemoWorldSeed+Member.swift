import Foundation

/// The member (Sara Capriotti) side of the seed: her event relationships
/// (`web/v3/index.html` `MY_EVENTS`), her notification feed (`SEED_NOTIFS`),
/// and her own profile (`SEED_PROFILE` + the Profile screen's hardcoded
/// Standing/reputation numbers).
extension DemoWorldSeed {
    /// Mirrors `MY_EVENTS` exactly — 7 rows, one per event where Sara has a
    /// relationship. No row exists for "roof" (draft, invisible to members)
    /// or "sunset"/"rooftop" (other venues she never applied to).
    public static func myEvents() -> [MyEventRow] {
        [
            MyEventRow(eventId: "pool", state: .confirmed, code: "LST-4F"),
            MyEventRow(eventId: "lounge", state: .applied),
            // Web has no real due timestamp; seeded as "now" so
            // `StoryEscalation` has a concrete anchor to escalate from.
            MyEventRow(eventId: "bath", state: .checkedIn, story: .due, storyDueAt: Date()),
            MyEventRow(
                eventId: "vinyl", state: .checkedIn, story: .verified,
                verdict: StoryVerdict(score: 92, reason: "Tag visible, posted in window")
            ),
            MyEventRow(eventId: "tasting", state: .notSelected),
            MyEventRow(eventId: "harbor", state: .cancelled),
            MyEventRow(eventId: "rooftop", state: .waitlisted),
        ]
    }

    /// Mirrors `SEED_NOTIFS` exactly.
    public static func notifications() -> [AppNotification] {
        [
            AppNotification(
                id: "n1", kind: .pass, text: "Tonight · Pool Day — your pass is ready", eventId: "pool"
            ),
            AppNotification(
                id: "n2", kind: .story, text: "Sound Bath — your Story is due", eventId: "bath"
            ),
            AppNotification(
                id: "n3", kind: .drop, text: "New room Friday — Late Lounge", eventId: "lounge"
            ),
        ]
    }

    /// Mirrors `SEED_PROFILE`/`mockCreatorDataFetch` (followers, engagement,
    /// audience, tier) plus the Profile screen's own hardcoded reputation
    /// stat tile (9.4 — see `MemberProfile` doc comment on the disagreement
    /// with her `ApplicantCard` record). `nightsAttended`/`showsAttended`
    /// reuse her venue-side reputation record (`a1`: nights 18, shows 17) —
    /// the web has no separate seed for these on the Profile screen itself,
    /// so this wave derives them from the one number the web world actually
    /// tracks for her attendance history. `storiesVerified` is 1, matching
    /// the seed's only currently-verified row ("vinyl").
    public static func memberProfile() -> MemberProfile {
        MemberProfile(
            id: "a1", fullName: "Sara Capriotti", handle: "capriottisara", photoName: "saraFull",
            followersCount: 28400, tiktokFollowers: 51200, engagementRate: 0.058, isVerified: false,
            genderFemalePct: 0.62,
            audienceCountries: [
                AudienceCountry(label: "Lebanon", pct: 0.71),
                AudienceCountry(label: "UAE", pct: 0.14),
                AudienceCountry(label: "Saudi", pct: 0.07),
                AudienceCountry(label: "Other EU", pct: 0.08),
            ],
            tier: .one, reputationScore: 9.4, strikes: 0,
            nightsAttended: 18, showsAttended: 17, storiesVerified: 1
        )
    }
}
