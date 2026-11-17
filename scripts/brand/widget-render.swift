// Draws the iOS home screen widget with its own code, for the Features page.
// Compiled together with the widget's source by capture-widget.sh; it is not
// part of the site. Usage: widget-render <folder to write the PNG files to>
import SwiftUI
import UIKit

/// Favorites from the demo account, as the app hands them to the widget (WEB and KJV)
let lamp = WidgetVerse(
    id: 14, content: "<sup>105</sup> Your word is a lamp to my feet, and a light for my path.",
    book: "Psalms", chapter: 119, start_verse: 105, end_verse: 105, tags: [])
let trust = WidgetVerse(
    id: 9,
    content: "<sup>5</sup> Trust in Yahweh with all your heart, and don’t lean on your own understanding. <sup>6</sup> In all your ways acknowledge him, and he will make your paths straight.",
    book: "Proverbs", chapter: 3, start_verse: 5, end_verse: 6, tags: [])
let shepherd = WidgetVerse(
    id: 13,
    content: "<sup>1</sup> The LORD is my shepherd; I shall not want. <sup>2</sup> He maketh me to lie down in green pastures: he leadeth me beside the still waters. <sup>3</sup> He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
    book: "Psalms", chapter: 23, start_verse: 1, end_verse: 3, tags: [])

/// Widget sizes on a 6.9" iPhone, in points
let small = CGSize(width: 170, height: 170)
let medium = CGSize(width: 364, height: 170)
let large = CGSize(width: 364, height: 382)

@MainActor
func draw<Content: View>(_ view: Content, _ size: CGSize, _ name: String, in folder: String) {
    // What the system gives a home screen widget: its background, 16 points of
    // room around the content, and rounded corners
    let widget = view
        .padding(16)
        .frame(width: size.width, height: size.height)
        .background(StickerTheme.background)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .environment(\.colorScheme, .light)
    let renderer = ImageRenderer(content: widget)
    renderer.scale = 3
    guard let data = renderer.uiImage?.pngData() else { fatalError("could not draw \(name)") }
    let file = URL(fileURLWithPath: folder).appendingPathComponent("\(name).png")
    do { try data.write(to: file) } catch { fatalError("could not write \(file.path): \(error)") }
    print("\(Int(size.width * 3))×\(Int(size.height * 3))  \(name).png")
}

@main
struct WidgetRender {
    @MainActor
    static func main() {
        guard CommandLine.arguments.count > 1 else { fatalError("usage: widget-render <folder>") }
        let folder = CommandLine.arguments[1]
        let entry = { (verse: WidgetVerse) in VerseEntry(date: .now, verse: verse) }
        draw(HomeScreenSmallView(entry: entry(lamp)), small, "small-lamp", in: folder)
        draw(HomeScreenMediumView(entry: entry(trust)), medium, "medium", in: folder)
        draw(HomeScreenLargeView(entry: entry(shepherd)), large, "large", in: folder)
    }
}
