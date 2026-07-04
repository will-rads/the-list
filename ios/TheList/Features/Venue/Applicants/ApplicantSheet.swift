import SwiftUI

// Web `ApplicantSheet` — the full applicant detail: photo + quality score,
// Reputation, Socials, Audience, then the Pass/Pick decide footer. Opened by
// tapping the card in the review deck.
struct ApplicantSheet: View {
    let applicant: ApplicantCard
    let onDecide: (Bool) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Capsule().fill(Theme.line2).frame(width: 40, height: 4).frame(maxWidth: .infinity).padding(.top, Theme.Space.m)

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: Theme.Space.l) {
                    hero
                    reputation
                    socials
                    if applicant.audienceFemalePct > 0 || !applicant.audienceCountries.isEmpty {
                        audience
                    }
                }
                .padding(.top, Theme.Space.l)
            }

            HStack(spacing: Theme.Space.m) {
                Button { onDecide(false) } label: {
                    HStack(spacing: Theme.Space.s) {
                        AppIcon.close.symbol.font(.system(size: 18, weight: .medium))
                        Text("Pass").font(Typography.body(14, weight: .semibold))
                    }
                    .foregroundStyle(Theme.ink)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                }
                .buttonStyle(PressButtonStyle())

                Button { onDecide(true) } label: {
                    HStack(spacing: Theme.Space.s) {
                        AppIcon.check.symbol.font(.system(size: 18, weight: .medium))
                        Text("Pick").font(Typography.body(14, weight: .semibold))
                    }
                    .foregroundStyle(Theme.iceInk)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Capsule().fill(Theme.ice))
                    .shadow(color: Theme.iceGlow, radius: 10)
                }
                .buttonStyle(PressButtonStyle())
            }
            .padding(.top, Theme.Space.m)
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.bottom, Theme.Space.xl)
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            VenuePhoto(key: applicant.photoName)
                .aspectRatio(4.0 / 5.0, contentMode: .fill)
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
            LinearGradient(colors: [.black.opacity(0.92), .clear], startPoint: .bottom, endPoint: .top)
                .frame(height: 160)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(applicant.name)
                    .font(Typography.display(28))
                    .tracking(28 * Typography.displayTracking)
                    .foregroundStyle(MemberPalette.onPhoto)
                HStack(spacing: 6) {
                    Text(MemberFormatting.oneDecimal(applicant.qualityScore * 10)).font(Typography.number(18))
                    AppIcon.sparkles.symbol.font(.system(size: 14, weight: .medium)).opacity(0.8)
                }
                .foregroundStyle(MemberPalette.onPhoto)
            }
            .padding(Theme.Space.l)
        }
    }

    private var reputation: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xs) {
            stamp("Reputation")
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(MemberFormatting.oneDecimal(applicant.reputationScore))
                    .font(Typography.number(28)).foregroundStyle(Theme.ice)
                Text("/ 10").font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.inkMute)
            }
            Text("Nights \(applicant.nights) · Shows \(applicant.shows) · No-shows \(applicant.noShows)")
                .font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.inkMute)
            if applicant.strikes > 0 {
                Text("Strikes \(applicant.strikes)").font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.inkMute)
            }
            if applicant.withYou > 0 {
                Text("With you × \(applicant.withYou)").font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.inkMute)
            }
        }
    }

    private var socials: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xs) {
            stamp("Socials")
            HStack(spacing: Theme.Space.l) {
                socialStat(MemberFormatting.followers(applicant.instagramFollowers) + " IG", url: applicant.instagramURL)
                socialStat(MemberFormatting.followers(applicant.tiktokFollowers) + " TikTok", url: applicant.tiktokURL)
            }
        }
    }

    @ViewBuilder
    private func socialStat(_ text: String, url: String?) -> some View {
        if let url, let link = URL(string: url) {
            Link(text, destination: link)
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(Theme.ink2)
        } else {
            Text(text).font(Typography.body(13, weight: .regular)).foregroundStyle(Theme.ink2)
        }
    }

    private var audience: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            stamp("Audience")
            if applicant.audienceFemalePct > 0 {
                let female = MemberFormatting.wholePercent(applicant.audienceFemalePct)
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("\(female)% female").font(Typography.body(11, weight: .regular))
                        Spacer()
                        Text("\(100 - female)% male").font(Typography.body(11, weight: .regular))
                    }
                    .foregroundStyle(Theme.inkMute)
                    GeometryReader { geo in
                        HStack(spacing: 0) {
                            Rectangle().fill(Theme.ice).frame(width: geo.size.width * CGFloat(female) / 100)
                            Rectangle().fill(Theme.elev2)
                        }
                    }
                    .frame(height: 6)
                    .clipShape(Capsule())
                }
            }
            if !applicant.audienceCountries.isEmpty {
                FlowChips(items: applicant.audienceCountries)
            }
        }
    }

    private func stamp(_ text: String) -> some View {
        Text(text).font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
    }
}

private struct FlowChips: View {
    let items: [AudienceCountry]
    private let columns = [GridItem(.adaptive(minimum: 84), spacing: Theme.Space.s, alignment: .leading)]

    var body: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: Theme.Space.s) {
            ForEach(items, id: \.label) { country in
                Text("\(country.label) \(MemberFormatting.wholePercent(country.pct))%")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.horizontal, Theme.Space.m)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(Theme.elev2))
            }
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            ApplicantSheet(applicant: world.applicants[0], onDecide: { _ in }).memberSheetChrome(detents: [.large])
        }
        .preferredColorScheme(.dark)
}
