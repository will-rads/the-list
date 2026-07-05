// swift-tools-version: 6.0
// TheListCore — the Codex-verifiable slice of the app (plan 2026-07-04).
// Models + Services are pure Swift (Foundation + Observation only), so this
// package compiles and its tests run on ANY Swift 6 toolchain — Windows
// included. The SwiftUI app target (project.yml/XcodeGen) shares these same
// source files; this manifest never ships, it exists for `swift test`.
import PackageDescription

let package = Package(
    name: "TheListCore",
    platforms: [.iOS(.v17), .macOS(.v14)],
    targets: [
        .target(
            name: "TheListCore",
            path: "TheList",
            sources: ["Models", "Services"]
        ),
        .testTarget(
            name: "TheListCoreTests",
            dependencies: ["TheListCore"],
            path: "TheListTests"
        ),
    ]
)
