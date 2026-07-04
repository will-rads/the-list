import SwiftUI

// The venue side's shell (web `App` for the venue half): the onboarding gate
// (splash → login → group → venue setup, or the zero-typing demo path), the
// four-tab screen switch under a floating GlassDock (Desk / Events / Door /
// Venue), the full-screen overlays that paint OVER the dock (post wizard /
// review deck / recap), the shared sheets (Activity / guest list / confirm),
// and the toast host.
//
// Owns its own @Observable `DemoWorld`, service bag, and router — this app
// only ever mounts one side at a time (member XOR venue), so there is no
// cross-side sharing to arrange; see `MemberRootView` for the mirror.
struct VenueRootView: View {
    @State private var world: DemoWorld
    @State private var services: VenueServices
    @State private var router = VenueRouter()

    @State private var toastText: String?
    @State private var toastToken = 0

    init() {
        let seededWorld = DemoWorld()
        _world = State(initialValue: seededWorld)
        _services = State(initialValue: VenueServices(world: seededWorld))
    }

    var body: some View {
        @Bindable var router = router

        ZStack {
            if router.onboarding != nil {
                onboardingContent
                    .transition(.opacity)
            } else {
                tabShell
                overlayLayer
                toastHost
            }
        }
        .animation(.easeInOut(duration: 0.35), value: router.onboarding)
        .environment(world)
        .environment(services)
        .environment(router)
        .sheet(item: $router.sheet) { sheet in
            sheetContent(sheet)
        }
        .onChange(of: world.toast) { _, message in
            if let message { presentToast(message) }
        }
        .onChange(of: router.uiToast) { _, request in
            if let request { presentToast(request.text) }
        }
        .task(id: toastToken) { await autoDismissToast() }
    }

    // MARK: Onboarding

    @ViewBuilder
    private var onboardingContent: some View {
        switch router.onboarding ?? .intro {
        case .intro:      ScreenVenueIntro()
        case .login:      ScreenVenueLogin()
        case .group:      ScreenOnboardGroup()
        case .venueSetup: ScreenOnboardVenue()
        }
    }

    // MARK: Tab shell

    private var tabShell: some View {
        ZStack(alignment: .bottom) {
            currentTab
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .ignoresSafeArea(.container, edges: .top)

            GlassDock(items: dockItems, selection: dockSelection)
                .padding(.bottom, Theme.Space.m)
        }
    }

    @ViewBuilder
    private var currentTab: some View {
        switch router.tab {
        case .desk:   DeskView()
        case .events: EventsListView()
        case .door:   DoorView()
        case .venue:  VenueProfileView()
        }
    }

    private var dockItems: [GlassDock<VenueTab>.Item] {
        [
            .init(.desk,   icon: .sparkles, label: "Tonight"),
            .init(.events, icon: .calendar, label: "Events"),
            .init(.door,   icon: .user,     label: "Door"),
            .init(.venue,  icon: .ticket,   label: "Venue"),
        ]
    }

    private var dockSelection: Binding<VenueTab> {
        Binding(get: { router.tab }, set: { router.selectTab($0) })
    }

    // MARK: Overlays

    @ViewBuilder
    private var overlayLayer: some View {
        if let overlay = router.overlay {
            switch overlay {
            case .postWizard(let editingEventId):
                PostWizardView(editingEventId: editingEventId).transition(.opacity)
            case .reviewDeck(let eventId):
                ReviewDeckView(eventId: eventId).transition(.opacity)
            case .recap(let eventId):
                RecapView(eventId: eventId).transition(.opacity)
            }
        }
    }

    // MARK: Sheets

    @ViewBuilder
    private func sheetContent(_ sheet: VenueSheet) -> some View {
        switch sheet {
        case .notifications:
            VenueNotificationsSheet().memberSheetChrome()
        case .guestList(let eventId):
            GuestListSheet(eventId: eventId).memberSheetChrome()
        case .confirm(let spec):
            ConfirmDialog(spec: spec).memberSheetChrome(detents: [.medium])
        }
    }

    // MARK: Toast host

    @ViewBuilder
    private var toastHost: some View {
        if let toastText {
            VStack {
                Spacer()
                ToastView(message: toastText)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .padding(.bottom, 104)
            }
            .allowsHitTesting(false)
        }
    }

    private func presentToast(_ text: String) {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            toastText = text
        }
        toastToken += 1
    }

    private func autoDismissToast() async {
        guard toastText != nil else { return }
        try? await Task.sleep(for: .seconds(2.2))
        guard !Task.isCancelled else { return }
        withAnimation(.easeOut(duration: 0.25)) { toastText = nil }
        world.toast = nil
        router.uiToast = nil
    }
}

#Preview("Dark") {
    VenueRootView()
        .appGround()
        .environment(AppState())
        .preferredColorScheme(.dark)
}
