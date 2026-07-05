import SwiftUI
import PhotosUI
import UIKit

// Web `StorySheet` — the exchange restated (1 Story + venue tag), a screenshot
// picker (PhotosPicker; PhotosUI is imported here only), a preview, then Submit →
// "Under review · we check within a few hours". The AI verdict (91/64/32) and the
// re-upload path are driven by the world afterwards (My Events → Past).
struct StorySheet: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberServices.self) private var services
    @Environment(MemberRouter.self) private var router

    let eventId: String

    @State private var pickedItem: PhotosPickerItem?
    @State private var preview: Image?

    private var event: EventItem? { world.events.first { $0.id == eventId } }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                SheetHeader(title: "Your Story") { router.dismissSheet() }

                if let event {
                    Text("\(event.title) · \(event.venueName)")
                        .font(Typography.body(12, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                }

                exchangeCard
                picker

                Button(action: submit) {
                    HStack(spacing: Theme.Space.s) {
                        Text("Submit").font(Typography.body(13, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundStyle(preview == nil ? Theme.inkMute : Theme.iceInk)
                    .frame(maxWidth: .infinity).frame(height: 48)
                    .background(Capsule().fill(preview == nil ? Theme.elev2 : Theme.ice))
                }
                .buttonStyle(PressButtonStyle())
                .disabled(preview == nil)

                Text(Copy.storyUnderReviewLine)
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.top, Theme.Space.l)
            .padding(.bottom, Theme.Space.xxl)
        }
        .onChange(of: pickedItem) { _, item in loadPreview(item) }
    }

    private var exchangeCard: some View {
        HStack(alignment: .top, spacing: Theme.Space.m) {
            AppIcon.instagram.symbol
                .font(.system(size: 14, weight: .medium)).foregroundStyle(Theme.ink)
                .frame(width: 32, height: 32)
                .overlay(Circle().strokeBorder(Theme.line2, lineWidth: 1))
            Text(Copy.storyExchangeLine)
                .font(Typography.body(12, weight: .regular))
                .foregroundStyle(Theme.ink2)
        }
        .padding(Theme.Space.l)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardGlass(radius: Theme.Radius.control)
    }

    private var picker: some View {
        PhotosPicker(selection: $pickedItem, matching: .images) {
            if let preview {
                VStack(spacing: 0) {
                    preview
                        .resizable().scaledToFill()
                        .frame(maxWidth: .infinity, maxHeight: 300).clipped()
                    Text("Tap to swap the screenshot")
                        .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                        .padding(.vertical, Theme.Space.s)
                }
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                        .strokeBorder(Theme.line2, lineWidth: 1)
                )
            } else {
                VStack(spacing: Theme.Space.s) {
                    AppIcon.image.symbol
                        .font(.system(size: 22, weight: .light)).foregroundStyle(Theme.inkMute)
                    Text("Pick the screenshot")
                        .font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.inkMute)
                }
                .frame(maxWidth: .infinity).frame(height: 160)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                        .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
                        .foregroundStyle(Theme.line2)
                )
            }
        }
        .buttonStyle(.plain)
    }

    private func loadPreview(_ item: PhotosPickerItem?) {
        guard let item else { return }
        Task {
            if let data = try? await item.loadTransferable(type: Data.self),
               let uiImage = UIImage(data: data) {
                preview = Image(uiImage: uiImage)
            }
        }
    }

    private func submit() {
        guard preview != nil else { return }
        Task { await services.stories.submitStory(eventId: eventId) }
        router.dismissSheet()
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            StorySheet(eventId: "bath").memberSheetChrome()
        }
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
