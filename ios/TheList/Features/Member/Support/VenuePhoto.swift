import SwiftUI

// Resolves a seed image-name key (the web `IMG.*` dictionary keys stored on
// `EventItem.imageName` / `galleryImageNames` / `MemberProfile.photoName`) to a
// pixel source, and renders it filling its frame. Everything loads from the SAME
// Unsplash URLs the web uses (via AsyncImage) EXCEPT the two the web serves
// locally — `beachClub` (its signature Pool Day hero, web `../assets/pool-day.jpg`)
// which is bundled as the `pool-day` imageset. While a remote image loads (or if
// it fails) a Theme-tinted placeholder fills the frame so layout never jumps.
enum MemberImage {
    /// Bundled asset name for keys the web serves locally; `nil` = load remote.
    static func bundledAsset(_ key: String) -> String? {
        key == "beachClub" ? "pool-day" : nil
    }

    /// The web `IMG` Unsplash URLs, verbatim (query string included so the CDN
    /// returns the same crop/size the prototype requests).
    static func url(_ key: String) -> URL? {
        let base = "https://images.unsplash.com/"
        let suffix = "?w=900&q=80&auto=format&fit=crop"
        let paths: [String: String] = [
            "pool":       "photo-1540541338287-41700207dee6",
            "rooftop":    "photo-1551918120-9739cb430c6d",
            "restaurant": "photo-1592861956120-e524fc739696",
            "club":       "photo-1545128485-c400e7702796",
            "clubRed":    "photo-1566737236500-c8ac43014a67",
            "gym":        "photo-1534438327276-14e5300c3a48",
            "lounge":     "photo-1414235077428-338989a2e8c0",
            "cocktail":   "photo-1514362545857-3bc16c4c7d1b",
        ]
        if key == "beirut" {
            return URL(string: base + "photo-1620553967747-50fdadc4b606?w=1200&q=80&auto=format&fit=crop")
        }
        if key == "saraFull" {
            return URL(string: base + "photo-1524504388940-b1c1722653e1" + suffix)
        }
        guard let path = paths[key] else { return nil }
        return URL(string: base + path + suffix)
    }
}

// Fills its frame with a venue/profile photo. Caller sets the frame + clip shape.
struct VenuePhoto: View {
    let key: String

    var body: some View {
        if let asset = MemberImage.bundledAsset(key) {
            Image(asset)
                .resizable()
                .scaledToFill()
        } else if let url = MemberImage.url(key) {
            AsyncImage(url: url, transaction: Transaction(animation: .easeOut(duration: 0.25))) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    PhotoPlaceholder()
                }
            }
        } else {
            PhotoPlaceholder()
        }
    }
}

// Theme-tinted stand-in while a remote photo loads or if it fails — a soft
// elev-over-elev2 wash so the card reads as "photo pending", not as an error.
private struct PhotoPlaceholder: View {
    var body: some View {
        LinearGradient(
            colors: [Theme.elev2, Theme.elev],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
        .overlay {
            AppIcon.image.symbol
                .font(.system(size: 22, weight: .light))
                .foregroundStyle(Theme.inkMute)
        }
    }
}
