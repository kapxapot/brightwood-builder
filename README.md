# Brightwood Builder

A web app for building **Brightwood Stories**.

## Reference Runtime

The actual Brightwood story renderer and player live in the neighboring `../brightwood` project.

When changing story JSON semantics in this builder, keep them aligned with the runtime behavior there, especially:

- `../brightwood/lib/story-engine.ts`
- `../brightwood/lib/message-renderer.ts`
- `../brightwood/components/story-player.tsx`

If this builder intentionally gets ahead of the runtime, document that gap clearly and plan the matching runtime update.

Live: https://builder.brightwood.ink

UI languages:

- English 🇬🇧
- Español 🇪🇸
- Italiano 🇮🇹
- 日本語 🇯🇵
- Русский 🇷🇺

Brightwood Stories Telegram bot: [@BrightwoodBot](https://t.me/BrightwoodBot) 🇷🇺

## Examples

You can view and edit several test stories:

- [Test](https://builder.brightwood.ink?edit=https://raw.githubusercontent.com/kapxapot/brightwood-builder/master/public/stories/test.json&lng=ru) 🇷🇺
- [Mystery](https://builder.brightwood.ink?edit=https://raw.githubusercontent.com/kapxapot/brightwood-builder/master/public/stories/mystery.json&lng=ru) 🇷🇺
- [Kolobok](https://builder.brightwood.ink?edit=https://raw.githubusercontent.com/kapxapot/brightwood-builder/master/public/stories/kolobok.json&lng=en) 🇬🇧

## Demos

Watch Brightwood Builder in action (🇬🇧).

### Building Kolobok story, Part 1

https://www.youtube.com/watch?v=ufNY-NnoYZw

[![Building Kolobok story, Part 1](https://img.youtube.com/vi/ufNY-NnoYZw/0.jpg)](https://www.youtube.com/watch?v=ufNY-NnoYZw)

### Building Kolobok story, Part 2

https://www.youtube.com/watch?v=ftAjJ5hoa5M

[![Building Kolobok story, Part 2](https://img.youtube.com/vi/ftAjJ5hoa5M/0.jpg)](https://www.youtube.com/watch?v=ftAjJ5hoa5M)
