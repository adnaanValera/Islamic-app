# Architecture decision record: project foundation

## Goals

The app must remain understandable as prayer calculations, Quran content,
location services, Bluetooth devices, notifications, accounts, and offline sync
arrive over time. It must also avoid paying the complexity cost of those systems
before they exist.

## Module boundaries

```text
lib/
  app/                     application composition
    router/                route table and route identities
    theme/                 Material 3 design system
  core/                    feature-agnostic infrastructure
    storage/               local persistence boundary
  features/
    home/
      domain/              home-owned models
      presentation/        screens and widgets
    feature_placeholder/   temporary destination UI only
  shared/                  reusable code proven to serve multiple features
```

When a real feature is started, it receives its own directory:

```text
features/prayer_times/
  data/                    DTOs, local/remote sources, repository implementation
  domain/                  entities, repository contracts, use cases
  presentation/            providers, screens, feature widgets
```

## Decisions

### Feature-first clean architecture

Files that change for the same product reason stay together. Layer boundaries
are introduced inside a feature as its behavior grows, keeping small features
lightweight while protecting complex ones from UI and infrastructure coupling.

### Riverpod at composition boundaries

`ProviderScope` is installed from day one. Providers will expose use cases and
immutable state to widgets; widgets will not talk directly to Hive, HTTP,
platform services, or Bluetooth APIs. The current static Home screen deliberately
does not invent state that does not exist.

### GoRouter with stable named routes

Every planned feature has a stable path and route name. This supports deep links,
notification destinations, and future authenticated route guards. Placeholder
builders can be replaced feature by feature without changing callers.

### Hive CE behind an application service

Hive CE is a maintained community continuation of Hive and is suitable for fast,
offline key-value data. Initialization is centralized. Feature repositories will
own box names and serialization; UI code will never access boxes directly. SQL
may still be introduced for relational Quran/search data without replacing the
preferences store.

### Material 3 design tokens

Color, shape, and typography begin in one theme. Feature widgets use semantic
theme values so dark mode, branding, accessibility, and larger form factors can
evolve consistently.

## Deferred intentionally

- Authentication and cloud sync contracts, until backend requirements exist.
- A repository abstraction for features with no data yet.
- Location, notification, and Bluetooth packages, until their first use case.
- Code generation, localization, analytics, and flavoring, to be introduced with
  concrete requirements rather than speculative scaffolding.
