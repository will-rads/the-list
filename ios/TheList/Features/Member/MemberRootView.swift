import SwiftUI

// The member side's shell (web `App` for the member half): the onboarding gate,
// the four-tab screen switch under a floating GlassDock, the full-screen overlays
// (Event Detail / Pass / Picked) that paint OVER the dock, the bottom sheets
// (Notifications / Settings / Story / Share), and the toast host that bridges both
// the router's UI toasts and the DemoWorld's service toasts.
//
// Owns the three member singletons as @State: the shared @Observable DemoWorld
// (so timer-driven demo updates propagate to every screen), the service bag, and
// the navigation router. All three are injected into the environment for children.
struct MemberRootView: View {
    @State private var world: DemoWorld
    @State private var services: MemberServices
    @State private var router = MemberRouter()

    // Toast host state — mirrors whichever source last spoke (service or UI).
    @State private var toastText: String?
    @State private var toastToken = 0

    init() {
        let seededWorld = DemoWorld()
        _world = State(initialValue: seededWorld)
        _services = State(initialValue: MemberServices(world: seededWorld))
    }

    var body: some View {
        @Bindable var router = router

        ZStack {
            if router.onboarding != nil {
                OnboardingView()
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

    // MARK: Tab shell

    private var tabShell: some View {
        ZStack(alignment: .bottom) {
            currentTab
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                // Content extends under the status bar (web measures from frame top);
                // the dock still respects the bottom safe area.
                .ignoresSafeArea(.container, edges: .top)

            GlassDock(items: dockItems, selection: dockSelection)
                .padding(.bottom, Theme.Space.m)
        }
    }

    @ViewBuilder
    private var currentTab: some View {
        switch router.tab {
        case .home:    HomeView()
        case .explore: ExploreView()
        case .invites: MyEventsView(initialSegment: router.myEventsSegment)
        case .profile: ProfileView()
        }
    }

    private var dockItems: [GlassDock<MemberTab>.Item] {
        [
            .init(.home,    icon: .home,     label: "Home"),
            .init(.explore, icon: .explore,  label: "Explore"),
            .init(.invites, icon: .bookmark, label: "Invites"),
            .init(.profile, icon: .user,     label: "Profile"),
        ]
    }

    // Routes dock taps through the router (clears overlays + deep-link hint).
    private var dockSelection: Binding<MemberTab> {
        Binding(get: { router.tab }, set: { router.selectTab($0) })
    }

    // MARK: Overlays (paint over the dock; each re-applies its own ground)

    @ViewBuilder
    private var overlayLayer: some View {
        if let overlay = router.overlay {
            switch overlay {
            case .eventDetail(let id):
                EventDetailView(eventId: id).transition(.opacity)
            case .pass(let id):
                PassView(eventId: id).transition(.move(edge: .trailing))
            case .picked(let id):
                PickedView(eventId: id).transition(.opacity)
            }
        }
    }

    // MARK: Sheets

    @ViewBuilder
    private func sheetContent(_ sheet: MemberSheet) -> some View {
        switch sheet {
        case .notifications: NotificationsSheet().memberSheetChrome()
        case .settings:      SettingsSheet().memberSheetChrome()
        case .story(let id): StorySheet(eventId: id).memberSheetChrome()
        case .share(let id): ShareSheet(eventId: id).memberSheetChrome(detents: [.medium, .large])
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
    MemberRootView()
        .appGround()
        .environment(AppState())
        .preferredColorScheme(.dark)
}
