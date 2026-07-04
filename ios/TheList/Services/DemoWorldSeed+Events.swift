import Foundation

/// The 9-event catalog merging `web/v3/index.html` `EVENTS` (member Explore,
/// all 9) with `web/v2/venue.html` `SEED_EVENTS` (the 6 the demo venue
/// manages: "pool", "lounge", "roof", "bath", "vinyl", "harbor" — see
/// `DemoWorld.venueManagedEventIds`). "tasting", "sunset", and "rooftop" are
/// other venues' events a member can browse on Explore but this demo login
/// never operates.
///
/// **Disagreement kept as-is:** `web/v3/index.html` labels the "harbor" event
/// `venue: "Harbor Club"` (member-facing), while `web/v2/venue.html` has the
/// single demo venue (Cyan Beach Club) operationally own its guest list and
/// cancellation. `EventItem.venueName` is a display string, not a foreign key
/// to `VenueProfile`, so both truths coexist without conflict: the member
/// sees "Harbor Club" on the card: the one venue this prototype's Venue-side
/// screens can drive still manages the underlying guests/cancel state.
extension DemoWorldSeed {
    public static func events() -> [EventItem] {
        [poolDay(), lateLounge(), rooftopSession(), soundBath(), vinylNight(), harborClubNight(),
         sunsetTasting(), sunsetSessions(), rooftopCocktails()]
    }

    /// Locked, today — 18 confirmed (17 + Sara's LST-4F), 1 expired pick
    /// (Maya Rahme, LST-9Q — the replacement-pick demo), 2 waitlist.
    private static func poolDay() -> EventItem {
        var guests: [GuestRow] = []
        let confirmedCodes: [(String, String)] = [
            ("a3", "LST-2A"), ("a4", "LST-2B"), ("a5", "LST-2C"), ("a6", "LST-2D"),
            ("a8", "LST-2E"), ("a9", "LST-2F"), ("a11", "LST-2G"), ("a12", "LST-2H"),
            ("a13", "LST-2J"), ("a14", "LST-2K"), ("a15", "LST-2L"), ("a16", "LST-2M"),
            ("a17", "LST-2N"), ("a18", "LST-2P"), ("a19", "LST-2R"), ("a20", "LST-2S"),
            ("a21", "LST-2T"),
        ]
        for (applicantId, code) in confirmedCodes {
            guests.append(GuestRow(applicantId: applicantId, state: .confirmed, code: code))
        }
        guests.append(GuestRow(applicantId: "a1", state: .confirmed, code: "LST-4F"))
        guests.append(GuestRow(applicantId: "a10", state: .expired, code: "LST-9Q"))
        guests.append(GuestRow(applicantId: "a22", state: .waitlisted))
        guests.append(GuestRow(applicantId: "a23", state: .waitlisted))

        return EventItem(
            id: "pool", title: "Pool Day", venueName: "Cyan Beach Club", area: "Jiyeh", type: "Beach",
            date: DemoWorld.today, time: "14:00", doors: "14:00", stage: .locked, seats: 20,
            mix: .init(girls: 15, guys: 5), appliedTotal: 137, closesAt: "Sat · 24 May · 20:00",
            brief: EventBrief(
                arrivalWindow: "14:00 – 15:00", dressCode: "Beach chic",
                meetingPoint: "Host stand — ask for Rami",
                houseRules: "1 Story + venue tag during the event"
            ),
            bundle: .twenty, imageName: "beachClub",
            galleryImageNames: ["beachClub", "pool", "cocktail", "beirut"], guests: guests
        )
    }

    /// Open — 24 unswiped applicants (Sara among them), 137 lifetime applied.
    private static func lateLounge() -> EventItem {
        let applicantIds = [
            "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a11", "a12", "a13",
            "a14", "a15", "a16", "a17", "a18", "a19", "a20", "a21", "a22", "a23", "a24", "a25",
        ]
        let guests = applicantIds.map { GuestRow(applicantId: $0, state: .applied) }

        return EventItem(
            id: "lounge", title: "Late Lounge", venueName: "Cyan Beach Club", area: "Jiyeh", type: "Lounge",
            date: "Fri · 30 May", time: "22:00", doors: "22:00", stage: .open, seats: 20,
            mix: .init(girls: 15, guys: 5), appliedTotal: 137, closesAt: "Fri · 30 May · 20:00",
            brief: EventBrief(
                arrivalWindow: "21:30 – 22:30", dressCode: "Smart dark", meetingPoint: "Door host",
                houseRules: "1 Story + venue tag during the event"
            ),
            bundle: .twenty, imageName: "lounge",
            galleryImageNames: ["lounge", "cocktail", "restaurant"], guests: guests
        )
    }

    /// Draft — never visible to members (`EventItem.isVisibleToMembers`).
    /// Same venue as Pool Day/Late Lounge; no guests/bundle/brief yet.
    private static func rooftopSession() -> EventItem {
        EventItem(
            id: "roof", title: "Rooftop Session", venueName: "Cyan Beach Club", area: "Jiyeh", type: "Club",
            date: "Sat · 31 May", time: "21:00", doors: "21:00", stage: .draft, seats: 30,
            imageName: "rooftop", galleryImageNames: ["rooftop"]
        )
    }

    /// Past, last night — 18 checked in (14 verified, 1 in review, 3 due
    /// incl. Sara), 2 no-shows. Story windows still open (invoice still due).
    private static func soundBath() -> EventItem {
        let verified: [(String, String, Double)] = [
            ("a3", "19:04", 8.8), ("a4", "19:07", 8.5), ("a5", "19:09", 8.9), ("a6", "19:11", 9.0),
            ("a8", "19:14", 8.7), ("a9", "19:16", 8.4), ("a11", "19:19", 8.6), ("a12", "19:21", 8.8),
            ("a13", "19:24", 8.5), ("a15", "19:31", 8.6), ("a16", "19:33", 8.7),
            ("a20", "19:43", 8.9), ("a21", "19:45", 8.5), ("a22", "19:47", 8.6),
        ]
        var guests = verified.map {
            GuestRow(applicantId: $0.0, state: .checkedIn, story: .verified, rating: $0.2, inAt: $0.1)
        }
        guests.append(GuestRow(applicantId: "a14", state: .checkedIn, story: .underReview, inAt: "19:28"))
        guests.append(GuestRow(applicantId: "a17", state: .checkedIn, story: .due, inAt: "19:36"))
        guests.append(GuestRow(applicantId: "a18", state: .checkedIn, story: .due, inAt: "19:39"))
        // Sara — checked in, story due (the member-side upload demo).
        guests.append(GuestRow(applicantId: "a1", state: .checkedIn, story: .due, inAt: "19:08"))
        guests.append(GuestRow(applicantId: "a2", state: .noShow))
        guests.append(GuestRow(applicantId: "a7", state: .noShow))

        return EventItem(
            id: "bath", title: "Sound Bath", venueName: "Cyan Beach Club", area: "Jiyeh", type: "Gym",
            date: "Sat · 24 May", time: "19:00", doors: "19:00", stage: .past, seats: 20,
            mix: .init(girls: 15, guys: 5), appliedTotal: 137,
            brief: EventBrief(
                arrivalWindow: "18:30 – 19:00", dressCode: "Comfortable active", meetingPoint: "Front desk",
                houseRules: "1 Story + venue tag during the event"
            ),
            bundle: .twenty, imageName: "gym", galleryImageNames: ["gym", "cocktail"], guests: guests,
            recap: RecapStats(confirmed: 20, showed: 18, noShows: 2, avgRating: 8.6),
            invoice: Invoice(bundleName: "The twenty", price: 700, status: .due), endedAt: 2
        )
    }

    /// Past, two weeks ago — 12 checked in (10 verified incl. Sara with a
    /// verdict, 2 missed their story). Invoice settled.
    private static func vinylNight() -> EventItem {
        let verified: [(String, String, Double)] = [
            ("a3", "21:10", 8.9), ("a4", "21:14", 8.7), ("a5", "21:17", 9.0), ("a6", "21:20", 9.1),
            ("a8", "21:24", 8.8), ("a9", "21:27", 8.6), ("a11", "21:31", 8.9), ("a12", "21:35", 8.7),
            ("a18", "21:44", 8.8),
        ]
        var guests = verified.map {
            GuestRow(applicantId: $0.0, state: .checkedIn, story: .verified, rating: $0.2, inAt: $0.1)
        }
        guests.append(GuestRow(applicantId: "a14", state: .checkedIn, story: .missed, inAt: "21:38"))
        guests.append(GuestRow(applicantId: "a16", state: .checkedIn, story: .missed, inAt: "21:41"))
        guests.append(GuestRow(
            applicantId: "a1", state: .checkedIn, story: .verified, rating: 9.2, inAt: "21:22",
            verdict: StoryVerdict(score: 92, reason: "Tag visible, posted in window")
        ))

        return EventItem(
            id: "vinyl", title: "Vinyl Night", venueName: "Cyan Beach Club", area: "Jiyeh", type: "Lounge",
            date: "Sun · 11 May", time: "21:00", doors: "21:00", stage: .past, seats: 12,
            mix: .init(girls: 10, guys: 2), appliedTotal: 72,
            brief: EventBrief(
                arrivalWindow: "21:00 – 22:00", dressCode: "Smart casual", meetingPoint: "Host at door",
                houseRules: "1 Story + venue tag during the event"
            ),
            bundle: .ten, imageName: "lounge", galleryImageNames: ["lounge", "cocktail", "restaurant"],
            guests: guests,
            recap: RecapStats(confirmed: 12, showed: 12, noShows: 0, avgRating: 8.9),
            invoice: Invoice(bundleName: "The ten", price: 400, status: .paid), endedAt: 1
        )
    }

    /// Cancelled — every guest flips to `.cancelled`, no charge/no strikes.
    /// Member-facing venue name is "Harbor Club" (see file-level doc comment
    /// on the venue-ownership disagreement this seed keeps deliberately).
    private static func harborClubNight() -> EventItem {
        let guests = ["a2", "a7", "a21", "a23", "a24", "a25"].map {
            GuestRow(applicantId: $0, state: .cancelled)
        }
        return EventItem(
            id: "harbor", title: "Harbor Club Night", venueName: "Harbor Club", area: "Dbayeh", type: "Club",
            date: "Thu · 22 May", time: "22:00", doors: "22:00", stage: .cancelled, seats: 20,
            mix: .init(girls: 15, guys: 5), appliedTotal: 64, bundle: .twenty,
            imageName: "club", galleryImageNames: ["club", "clubRed"], guests: guests
        )
    }

    /// Past — a different venue's event; Sara was not selected. Not modeled
    /// by the venue side (Mar Mikhael House is not the demo venue login).
    private static func sunsetTasting() -> EventItem {
        EventItem(
            id: "tasting", title: "Sunset Tasting", venueName: "Mar Mikhael House", area: "Mar Mikhael",
            type: "Restaurant", date: "Fri · 23 May", time: "19:30", doors: "19:30", stage: .past, seats: 12,
            appliedTotal: 88, imageName: "restaurant", galleryImageNames: ["restaurant", "lounge", "cocktail"]
        )
    }

    /// Open, closing-soon badge demo — a different venue (North Shore);
    /// Sara has no relationship to this one.
    private static func sunsetSessions() -> EventItem {
        EventItem(
            id: "sunset", title: "Sunset Sessions", venueName: "North Shore", area: "Batroun", type: "Beach",
            date: "Sat · 31 May", time: "17:00", doors: "17:00", stage: .open, seats: 30, appliedTotal: 64,
            closesAt: "Sat · 31 May · 12:00", closingSoon: true,
            brief: EventBrief(
                arrivalWindow: "16:30 – 17:30", dressCode: "Beach casual", meetingPoint: "Main entrance",
                houseRules: "1 Story + venue tag during the event"
            ),
            imageName: "pool", galleryImageNames: ["pool", "rooftop", "beirut", "cocktail"]
        )
    }

    /// Locked — a different venue (Beirut Terrasse); the waitlist-vocabulary
    /// demo on the member side. No relationship for Sara.
    private static func rooftopCocktails() -> EventItem {
        EventItem(
            id: "rooftop", title: "Rooftop Cocktails", venueName: "Beirut Terrasse", area: "Achrafieh",
            type: "Rooftop", date: "Sat · 7 Jun", time: "20:00", doors: "20:00", stage: .locked, seats: 18,
            appliedTotal: 54, closesAt: "Sat · 7 Jun · 18:00",
            brief: EventBrief(
                arrivalWindow: "20:00 – 21:00", dressCode: "Smart casual", meetingPoint: "Rooftop elevator",
                houseRules: "1 Story + venue tag during the event"
            ),
            imageName: "rooftop", galleryImageNames: ["rooftop", "cocktail", "beirut"]
        )
    }
}
