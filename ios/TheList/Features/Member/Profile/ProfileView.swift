import SwiftUI

// Web `ScreenProfile` — the editorial hero (photo melts into the ground via
// HeroMelt, no hard cut), name/handle, the reputation/followers/engagement stat
// strip, the Verify-with-Instagram upgrade strip (while estimated), Audience
// (gender split + country tiles), and Recent nights.
struct ProfileView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router

    private var profile: MemberProfile { world.memberProfile }
    private var verified: Bool { profile.isVerified || router.instagramVerified }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                hero
                statStrip
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.vertical, Theme.Space.l)
                    .overlay(alignment: .bottom) {
                        HairlineDivider(color: Theme.line2).padding(.horizontal, MemberLayout.hInset)
                    }

                if !verified { verifyStrip.padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l) }

                SectionHead(label: "Audience", right: verified ? "Live" : "Estimated")
                    .padding(.top, 28).padding(.bottom, Theme.Space.m)
                audience.padding(.horizontal, MemberLayout.hInset)

                SectionHead(label: "Recent").padding(.top, 36).padding(.bottom, Theme.Space.m)
                recent.padding(.horizontal, MemberLayout.hInset)

                Color.clear.frame(height: MemberLayout.dockClearance)
            }
        }
    }

    // MARK: Hero

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            VenuePhoto(key: profile.photoName)
                .frame(height: 460).frame(maxWidth: .infinity).clipped()
                .heroMelt()
            MemberPalette.profileTopScrim.frame(height: 460).allowsHitTesting(false)

            VStack(alignment: .leading, spacing: 0) {
                Text("Member since '24")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.ink2)
                    .padding(.bottom, Theme.Space.s)
                Text(nameLine)
                    .font(Typography.display(48))
                    .tracking(48 * Typography.displayTracking)
                    .lineSpacing(-6)
                    .foregroundStyle(Theme.ink)
                HStack(spacing: 6) {
                    AppIcon.instagram.symbol
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(Theme.ink.opacity(0.7))
                    Text("@\(profile.handle)")
                        .font(Typography.body(13, weight: .regular)).foregroundStyle(Theme.ink.opacity(0.8))
                }
                .padding(.top, Theme.Space.m)
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.bottom, Theme.Space.l)
        }
        .frame(height: 460)
        .overlay(alignment: .top) { heroControls }
        .overlay(alignment: .topTrailing) { verticalStamp }
    }

    private var heroControls: some View {
        HStack {
            HStack(spacing: 6) {
                Circle().fill(Theme.ice).frame(width: 6, height: 6)
                Text("\(verified ? "Verified" : "Self-reported") · Tier 1")
                    .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.ink)
            }
            .padding(.horizontal, 10).padding(.vertical, 6)
            .overImageGlass(radius: Theme.Radius.pill)
            Spacer()
            GlassIconButton(icon: .settings, size: 36, iconSize: 15) { router.present(.settings) }
        }
        .padding(.horizontal, MemberLayout.hInset)
        .padding(.top, 60)
    }

    private var verticalStamp: some View {
        Text("Beirut · MMXXVI · No. 048")
            .font(Typography.body(10, weight: .medium))
            .foregroundStyle(Theme.ink2)
            .fixedSize()
            .rotationEffect(.degrees(90))
            .frame(width: 20)
            .padding(.trailing, Theme.Space.l)
            .padding(.top, 130)
    }

    // MARK: Stat strip

    private var statStrip: some View {
        HStack(spacing: Theme.Space.s) {
            MemberStatTile(value: MemberFormatting.oneDecimal(profile.reputationScore), label: "Reputation", ice: true)
            MemberStatTile(value: MemberFormatting.followers(profile.followersCount), label: "Followers")
            MemberStatTile(value: MemberFormatting.engagementPercent(profile.engagementRate), label: "Engagement")
        }
    }

    // MARK: Verify strip

    private var verifyStrip: some View {
        HStack(spacing: Theme.Space.m) {
            AppIcon.instagram.symbol
                .font(.system(size: 16, weight: .medium)).foregroundStyle(Theme.ink.opacity(0.7))
            VStack(alignment: .leading, spacing: 2) {
                Text("Verify with Instagram")
                    .font(Typography.body(12, weight: .medium)).foregroundStyle(Theme.ink)
                Text("Numbers below are estimated. Connect for real data + tier upgrade.")
                    .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
            }
            Spacer(minLength: Theme.Space.s)
            Button { connect() } label: {
                Text("Connect")
                    .font(Typography.body(11, weight: .semibold)).foregroundStyle(Theme.iceInk)
                    .padding(.horizontal, Theme.Space.m).frame(height: 28)
                    .background(Capsule().fill(Theme.ice))
            }
            .buttonStyle(PressButtonStyle())
        }
        .padding(.horizontal, Theme.Space.m).padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardGlass(radius: Theme.Radius.control)
    }

    // MARK: Audience

    private var audience: some View {
        VStack(alignment: .leading, spacing: Theme.Space.m) {
            let female = MemberFormatting.wholePercent(profile.genderFemalePct)
            let male = 100 - female
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Female · \(female)%").font(Typography.body(11, weight: .regular))
                    Spacer()
                    Text("Male · \(male)%").font(Typography.body(11, weight: .regular))
                }
                .foregroundStyle(Theme.ink2)
                GeometryReader { geo in
                    HStack(spacing: 0) {
                        Rectangle().fill(Theme.ice).frame(width: geo.size.width * CGFloat(female) / 100)
                        Rectangle().fill(Theme.inkMute)
                    }
                }
                .frame(height: 6)
                .clipShape(Capsule())
                .background(Capsule().fill(Theme.elev2))
            }

            LazyVGrid(columns: [GridItem(.flexible(), spacing: Theme.Space.m), GridItem(.flexible())],
                      spacing: Theme.Space.m) {
                ForEach(Array(profile.audienceCountries.enumerated()), id: \.offset) { _, country in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(country.label)
                            .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                        Text("\(MemberFormatting.wholePercent(country.pct))%")
                            .font(Typography.number(18)).foregroundStyle(Theme.ink)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(Theme.Space.m)
                    .cardGlass(radius: Theme.Radius.control)
                }
            }
            .padding(.top, Theme.Space.xs)
        }
    }

    // MARK: Recent

    private var recent: some View {
        VStack(spacing: Theme.Space.m) {
            recentRow(title: "Pool Day vol. II", venue: "Cyan", date: "08 Apr", score: "9.5", image: "beachClub")
            recentRow(title: "Late Lounge", venue: "Centrale", date: "22 Apr", score: "9.2", image: "lounge")
        }
    }

    private func recentRow(title: String, venue: String, date: String, score: String, image: String) -> some View {
        HStack(spacing: Theme.Space.m) {
            VenuePhoto(key: image)
                .frame(width: 48, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Typography.display(16)).tracking(16 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("\(venue) · \(date)")
                    .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    .shadow(color: Theme.textShadow, radius: 8, y: 1)
            }
            Spacer(minLength: Theme.Space.s)
            Text(score).font(Typography.number(16)).foregroundStyle(Theme.ice)
        }
    }

    // MARK: Derived + actions

    private var nameLine: String {
        let parts = profile.fullName.split(separator: " ", maxSplits: 1).map(String.init)
        guard parts.count > 1 else { return profile.fullName }
        return "\(parts[0])\n\(parts[1])"
    }

    private func connect() {
        router.instagramVerified = true
        router.toast("Instagram connected · verified")
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    ProfileView()
        .appGround()
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
