import Foundation

/// Story proof — submit a screenshot, get an AI-assisted verdict a few hours
/// later (in the mock: `verdictDelay` seconds later; production: a Gemini
/// Edge Function per spec §4). "Submit" is abstracted to just the eventId —
/// there is no real file picker/upload pipeline in this pure-Swift layer;
/// that belongs to a later wave's screen.
@MainActor
public protocol StoryService {
    func submitStory(eventId: String) async
    func storyStatus(eventId: String) async -> StoryStatus?
}

@MainActor
public struct MockStoryService: StoryService {
    private let world: DemoWorld

    public init(world: DemoWorld) {
        self.world = world
    }

    public func submitStory(eventId: String) async {
        world.submitStory(eventId: eventId)
    }

    public func storyStatus(eventId: String) async -> StoryStatus? {
        world.myEvents.first { $0.eventId == eventId }?.story
    }
}
