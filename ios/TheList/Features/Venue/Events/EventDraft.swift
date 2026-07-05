import Foundation

// The post wizard's mutable in-progress event (web `ScreenPostEvent`'s `draft`
// state / `makeEvent()`). Venue-feature-local, not a Models addition — it only
// ever exists to be assembled into a real, frozen `EventItem` on Publish.
struct EventDraft {
    var id: String
    var title: String = ""
    var type: String = VenueCatalog.venueTypes.first!
    var date: String = ""
    var time: String = ""
    /// "24h before doors" | "48h before doors" | a custom string (web `closesAt`).
    var closesAt: String = "24h before doors"
    /// `nil` = no gender preference (web comment: "null === no gender preference").
    var mix: EventItem.Mix? = EventItem.Mix(girls: 15, guys: 5)
    var seats: Int = 20
    var bundle: EventBundle?
    var brief = EventBrief(arrivalWindow: "", dressCode: "", meetingPoint: "", houseRules: "")
    /// A `VenuePhoto`/`MemberImage` key (see `PresetImagePicker`'s doc comment
    /// for why this is a preset key rather than picked image data).
    var imageName: String?
    /// Web `exchange: "1 Story + venue tag"` — fixed for every new drop.
    let exchange = "1 Story + venue tag"

    /// A brand-new draft (web `makeEvent({ venueId, heroImage, closesAt })`),
    /// defaulting its photo to the venue's own hero per the wizard's Image
    /// step note ("Reuse your venue hero, or choose a new one").
    init(newId id: String, venueHeroImageName: String) {
        self.id = id
        self.imageName = venueHeroImageName
    }

    /// Prefills from an existing draft-stage `EventItem` (web `editDraft` →
    /// `initialDraft`/`draftId`).
    init(prefilling event: EventItem) {
        id = event.id
        title = event.title
        type = event.type
        date = event.date
        time = event.time
        closesAt = event.closesAt ?? "24h before doors"
        mix = event.mix
        seats = event.seats
        bundle = event.bundle
        brief = event.brief ?? EventBrief(arrivalWindow: "", dressCode: "", meetingPoint: "", houseRules: "")
        imageName = event.imageName
    }

    /// Web `StepBasics`'s `ok` — title, date, time set, and closesAt non-empty.
    var basicsValid: Bool {
        title.count >= 2 && !date.isEmpty && !time.isEmpty && !closesAt.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var totalSeats: Int { mix.map { $0.girls + $0.guys } ?? seats }

    /// Assembles the frozen `EventItem` the service publishes (web `publishEvent`
    /// builds `{ ...draft, stage: STAGE.open, guests: [], appliedTotal: 0 }` —
    /// `DemoWorld.publish` itself forces `stage = .open`, so the value passed
    /// here is only ever the pre-publish placeholder).
    func makeEventItem(venue: VenueProfile) -> EventItem {
        let photo = imageName ?? venue.heroImageName
        return EventItem(
            id: id, title: title, venueName: venue.name, area: venue.area, type: type,
            date: date, time: time, doors: time, stage: .draft, seats: totalSeats, mix: mix,
            appliedTotal: 0, closesAt: closesAt.isEmpty ? nil : closesAt, closingSoon: false,
            brief: brief, bundle: bundle, imageName: photo, galleryImageNames: [photo],
            guests: []
        )
    }
}
