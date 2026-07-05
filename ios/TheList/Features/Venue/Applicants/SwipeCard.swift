import SwiftUI

// Web `SwipeCard` — one applicant card in the review deck: photo, name,
// quality score, IG/TikTok follower counts, and tappable social pills.
struct SwipeCard: View {
    let applicant: ApplicantCard

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            VenuePhoto(key: applicant.photoName)
                .aspectRatio(4.0 / 5.0, contentMode: .fill)
                .frame(maxWidth: .infinity)
                .clipped()

            LinearGradient(
                colors: [.black.opacity(0.92), .black.opacity(0.0)],
                startPoint: .bottom, endPoint: .top
            )
            .frame(height: 260)

            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .lastTextBaseline) {
                    Text(applicant.name)
                        .font(Typography.display(28))
                        .tracking(28 * Typography.displayTracking)
                        .foregroundStyle(MemberPalette.onPhoto)
                    Spacer(minLength: Theme.Space.s)
                    HStack(spacing: 4) {
                        Text(MemberFormatting.oneDecimal(applicant.qualityScore * 10))
                            .font(Typography.number(20))
                        AppIcon.sparkles.symbol.font(.system(size: 14, weight: .medium))
                    }
                    .foregroundStyle(MemberPalette.onPhoto)
                }

                HStack(spacing: Theme.Space.l) {
                    HStack(spacing: 4) {
                        Text(MemberFormatting.followers(applicant.instagramFollowers)).font(Typography.number(13))
                        Text("IG").font(Typography.body(13, weight: .regular))
                    }
                    HStack(spacing: 4) {
                        Text(MemberFormatting.followers(applicant.tiktokFollowers)).font(Typography.number(13))
                        Text("TikTok").font(Typography.body(13, weight: .regular))
                    }
                }
                .foregroundStyle(MemberPalette.onPhoto)
                .padding(.top, Theme.Space.m)

                HStack(spacing: Theme.Space.s) {
                    socialPill("Instagram", icon: .instagram, urlString: applicant.instagramURL)
                    socialPill("TikTok", icon: .link, urlString: applicant.tiktokURL)
                    socialPill("Link", icon: .link, urlString: applicant.otherURL)
                }
                .padding(.top, Theme.Space.m)
            }
            .padding(Theme.Space.l)
        }
        .frame(maxWidth: .infinity)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
    }

    @ViewBuilder
    private func socialPill(_ label: String, icon: AppIcon, urlString: String?) -> some View {
        if let urlString, let url = URL(string: urlString) {
            Link(destination: url) {
                HStack(spacing: 6) {
                    icon.symbol.font(.system(size: 12, weight: .medium))
                    Text(label).font(Typography.body(12, weight: .medium))
                }
                .foregroundStyle(MemberPalette.onPhoto)
                .padding(.horizontal, Theme.Space.m)
                .frame(height: 36)
                .overlay(Capsule().strokeBorder(MemberPalette.onPhoto.opacity(0.32), lineWidth: 1))
            }
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    SwipeCard(applicant: world.applicants[0])
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
        .preferredColorScheme(.dark)
}
