import SwiftUI

// The entry splash background. DOCUMENTED DEVIATION from the web, which plays three
// 5s Veo montage clips (`INTRO_CLIPS`); here the bundled intro STILLS (intro-1/2/3)
// cross-dissolve on the same ~5s cadence — no bundled video, and a still crossfade
// keeps the grainy Beirut-night mood without an AVPlayer. Vignette + top/bottom
// scrims (MemberPalette.introScrim) keep the wordmark and CTAs legible, matching
// the web's layered scrims.
struct IntroBackground: View {
    private let stills = ["intro-1", "intro-2", "intro-3"]
    @State private var active = 0

    var body: some View {
        ZStack {
            MemberPalette.takeover

            ForEach(Array(stills.enumerated()), id: \.offset) { index, name in
                Image(name)
                    .resizable()
                    .scaledToFill()
                    .opacity(index == active ? 1 : 0)
                    .animation(.easeInOut(duration: 1.1), value: active)
            }

            // Vignette — soft dark edges (web `inset ... rgba(0,0,0,.82)`).
            RadialGradient(
                colors: [.clear, .black.opacity(0.82)],
                center: .center, startRadius: 120, endRadius: 460
            )

            MemberPalette.introScrim
        }
        .clipped()
        .ignoresSafeArea()
        .task { await cycle() }
    }

    private func cycle() async {
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(5))
            guard !Task.isCancelled else { return }
            active = (active + 1) % stills.count
        }
    }
}

#Preview("Dark") {
    IntroBackground().preferredColorScheme(.dark)
}
