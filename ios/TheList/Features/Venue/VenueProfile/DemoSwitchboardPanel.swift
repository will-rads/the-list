import SwiftUI

// Web `DemoPanel` — the hidden rig at the bottom of the Venue tab that drives
// the shared `DemoWorld` during pitches: new applicants arrive, a pick
// declines, advance to tonight, reset demo. Plain rows, deliberately not
// product UI (matches the member side's Settings › Demo).
struct DemoSwitchboardPanel: View {
    @Environment(VenueServices.self) private var services
    @Environment(VenueRouter.self) private var router

    @State private var open = false

    var body: some View {
        VStack(spacing: 0) {
            Button { withAnimation(.easeInOut(duration: 0.2)) { open.toggle() } } label: {
                HStack {
                    Text("Demo").font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    Spacer()
                    AppIcon.chevronRight.symbol
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Theme.inkMute)
                        .rotationEffect(.degrees(open ? 90 : 0))
                }
                .padding(.vertical, Theme.Space.s)
            }
            .buttonStyle(PressButtonStyle())

            if open {
                VStack(spacing: 0) {
                    row("New applicants arrive") { services.switchboard.newApplicants() }
                    row("A pick declines") { services.switchboard.declinePick() }
                    row("Advance to tonight") { services.switchboard.advanceToTonight() }
                    row("Reset demo") {
                        services.switchboard.reset()
                        router.resetLocal()
                    }
                }
            }
        }
        .padding(.top, Theme.Space.m)
    }

    private func row(_ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(Typography.body(12, weight: .regular))
                .foregroundStyle(Theme.ink2)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, 10)
                .overlay(alignment: .top) { HairlineDivider(color: Theme.line) }
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    DemoSwitchboardPanel()
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
