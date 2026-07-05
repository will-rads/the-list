import SwiftUI

// ONE icon vocabulary -> SF Symbols. No inline symbol names in Views: a family
// swap is a one-file edit here. Cases cover every glyph the web HICONS set uses
// plus the shapes the layout contract needs (ticket, chevrons, map).
enum AppIcon: String {
    case bell
    case search          // magnifying glass
    case arrowLeft
    case arrowRight
    case bookmark
    case bookmarkFill
    case share
    case settings
    case calendar
    case ticket
    case user            // profile
    case mapPin
    case check
    case close           // x
    case chevronLeft
    case chevronRight
    case chevronUp
    case chevronDown
    case home            // web Home tab = "sparkle"
    case explore         // web Explore tab = "compass"
    case map
    case instagram       // placeholder -> "camera" (see note below)
    case image
    case link
    case message         // web "paper-plane"
    case sliders
    case sparkles

    var systemName: String {
        switch self {
        case .bell:         return "bell"
        case .search:       return "magnifyingglass"
        case .arrowLeft:    return "arrow.left"
        case .arrowRight:   return "arrow.right"
        case .bookmark:     return "bookmark"
        case .bookmarkFill: return "bookmark.fill"
        case .share:        return "square.and.arrow.up"
        case .settings:     return "gearshape"
        case .calendar:     return "calendar"
        case .ticket:       return "ticket"
        case .user:         return "person"
        case .mapPin:       return "mappin.and.ellipse"
        case .check:        return "checkmark"
        case .close:        return "xmark"
        case .chevronLeft:  return "chevron.left"
        case .chevronRight: return "chevron.right"
        case .chevronUp:    return "chevron.up"
        case .chevronDown:  return "chevron.down"
        case .home:         return "sparkles"
        case .explore:      return "safari"
        case .map:          return "map"
        // No first-party Instagram glyph in SF Symbols; "camera" is the agreed
        // placeholder. Swap this one row when a brand asset is bundled.
        case .instagram:    return "camera"
        case .image:        return "photo"
        case .link:         return "link"
        case .message:      return "paperplane"
        case .sliders:      return "slider.horizontal.3"
        case .sparkles:     return "sparkles"
        }
    }

    var symbol: Image { Image(systemName: systemName) }
}

#Preview("Dark") { IconGallery().preferredColorScheme(.dark) }
#Preview("Light") { IconGallery().preferredColorScheme(.light) }

private struct IconGallery: View {
    private let all: [AppIcon] = [
        .bell, .search, .arrowLeft, .arrowRight, .bookmark, .bookmarkFill, .share,
        .settings, .calendar, .ticket, .user, .mapPin, .check, .close,
        .chevronLeft, .chevronRight, .chevronUp, .chevronDown, .home, .explore,
        .map, .instagram, .image, .link, .message, .sliders, .sparkles
    ]
    private let columns = Array(repeating: GridItem(.flexible()), count: 5)

    var body: some View {
        LazyVGrid(columns: columns, spacing: Theme.Space.l) {
            ForEach(all, id: \.rawValue) { icon in
                icon.symbol
                    .font(.system(size: 20))
                    .foregroundStyle(Theme.ink)
                    .frame(height: 28)
            }
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
