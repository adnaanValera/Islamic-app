# Islamic App

A production-oriented Flutter foundation for an Islamic mobile ecosystem.

## Architecture

The codebase uses feature-first clean architecture:

- `app/` composes application-wide dependencies, routing, and theming.
- `core/` contains cross-cutting infrastructure with no feature knowledge.
- `features/` owns product capabilities. A mature feature is divided into
  `data`, `domain`, and `presentation` layers.
- `shared/` is reserved for genuinely reusable UI and domain primitives.

Dependencies point inward: presentation may use domain abstractions, data
implements domain contracts, and feature modules do not reach into one another.
The initial placeholder catalog lives in Home because no future feature has real
business logic yet. Each feature already has a stable route that can later be
replaced by its own module without changing Home.

See [`docs/architecture.md`](docs/architecture.md) for the detailed decisions.

## Run locally

1. Install the current stable Flutter SDK (Dart 3.10 or newer).
2. From the project root, generate platform shells if they are absent:
   `flutter create --platforms=android,ios .`
3. Run `flutter pub get`.
4. Run `flutter analyze` and `flutter test`.
5. Start an emulator/device and run `flutter run`.
