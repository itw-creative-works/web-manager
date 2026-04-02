# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Changelog Categories

- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

---
## [4.1.34] - 2026-04-01
### Changed
- Bumped `@sentry/browser` from `^10.46.0` to `^10.47.0`.
- Bumped `lodash` from `^4.17.23` to `^4.18.1`.
- Improved CLAUDE.md singleton pattern documentation with clearer usage examples and explicit anti-patterns.

---
## [4.1.31] - 2026-03-24
### Changed
- Switched from `getFirestore` to `initializeFirestore` in `index.js` to support custom Firestore configuration options.
- Removed redundant `getFirestore` from firestore module's stored methods since the instance is already initialized in `index.js`.

---
## [4.1.30] - 2026-03-20
### Changed
- Bumped `@sentry/browser` from `^10.43.0` to `^10.45.0`.
- Bumped `chatsy` from `^2.0.9` to `^2.0.11`.
- Bumped `firebase` from `^12.10.0` to `^12.11.0`.

---
## [4.1.29] - 2026-03-19
### Changed
- Restructured notification subscription documents to use nested `metadata.created` and `metadata.updated` timestamps instead of top-level fields.
- Update operations now use dot-notation (`metadata.updated`) to preserve `metadata.created` when updating existing subscriptions.

---
## [4.1.28] - 2026-03-15
### Changed
- Bumped `chatsy` from `^2.0.5` to `^2.0.8`.
- Upgraded `prepare-package` from `^1.2.6` to `^2.0.7` (major version with esbuild bundler).
- Added `preparePackage.type = "copy"` config option.

---
## [4.1.27] - 2026-03-14
### Changed
- Renamed default brand config values from `id:'app'`/`name:'Application'` to `id:'brand'`/`name:'Brand'`.
- Renamed service worker config key from `app` to `brand` to align with brand terminology.

---
## [4.1.25] - 2026-03-13
### Added
- Automatically attach resolved subscription state (`state.resolved`) to auth state during processing, making `plan`, `active`, `trialing`, and `cancelling` available to bindings and consumers without manual calls.

---
## [4.1.24] - 2026-03-13
### Added
- Added `resolveSubscription()` method to Auth module that derives calculated subscription fields (plan, active, trialing, cancelling) from raw backend data.

---
## [4.1.22] - 2026-03-11
### Changed
- Renamed `config.tracking` to `config.analytics` with simplified property names: `google-analytics` → `google`, `google-analytics-secret` → `googleSecret`, `meta-pixel` → `meta`, `tiktok-pixel` → `tiktok`.

---
## [4.1.19] - 2026-03-11
### Added
- Added new chatsy import.

---
## [4.1.15] - 2026-02-26
### Fixed
- Fixed bindings skeleton removal happening prematurely when partial context updates didn't match any of the element's bindings.

### Changed
- `_executeAction` now returns a boolean indicating whether the action was processed, allowing `update()` to defer skeleton removal until at least one binding runs.

---
## [4.1.10] - 2026-02-17
### Changed
- Refactored auth to use promise-based settler pattern (`_authReady`) for reliable auth state detection, eliminating race conditions with late-registered listeners.
- Split `listen()` into two clear paths: `once` (waits for settler, fires once) and persistent (subscribes to all changes, catches up if already settled).
- Renamed `onAuthStateChanged` to `_subscribe` (internal-only).
- Removed unused `_readyCallbacks`.

---
## [4.1.1] - 2025-12-17
### Added
- Added `getBrowser()` utility to detect browser type (chrome, firefox, safari, edge, opera, brave).
- Added `data-browser` HTML attribute set during initialization.
- Added `browser` and `vendor` fields to `getContext().client`.
- Added `geolocation` object to `getContext()` with placeholder fields (ip, country, region, city, latitude, longitude).

### Changed
- Moved `vendor` from `browser` object to `client` object in `getContext()`.
- Replaced `browser` object with `geolocation` object in `getContext()` return structure.

---
## [4.1.0] - 2025-12-16
### Added
- Added `analytics.js` module for Google Analytics 4 Measurement Protocol support (browser extensions and Electron).
- Added `usage.js` module to track install date, session count, session duration, and version history.
- Added `tracking` config section for analytics credentials (`google-analytics`, `google-analytics-secret`, `meta-pixel`, `tiktok-pixel`).
- Added `runtime` config option for explicit runtime override.
- Added `buildTimeISO` auto-calculated from `buildTime`.
- Added `usage` data to bindings context for UI display.

### Changed
- Refactored `utilities.js` from standalone functions to class pattern for consistency with other modules.
- Simplified `getApiUrl()` to always prepend `api.` subdomain instead of replacing first subdomain.

## [4.0.33] - 2025-12-12
### BREAKING
- `@text` binding action no longer auto-detects input/textarea elements. Use `@value` for inputs instead.

### Added
- Added `@value` binding action for explicitly setting input/textarea values.

## [4.0.31] - 2025-12-03
### Added
- Added HTML data attributes (`data-platform`, `data-runtime`, `data-device`) on initialization for CSS targeting.
- Added `getPlatform()`, `getRuntime()`, `isMobile()`, and `getDeviceType()` as standalone exported utility functions.

### Changed
- Refactored `getContext()` to use the new standalone functions and include `deviceType` and `runtime` in client info.

## [4.0.29] - 2025-12-02
### Fixed
- Fixed notification subscription storing to incorrect Firestore path (`users/{uid}/notifications/{token}` → `notifications/{token}`).

### Changed
- Refactored `_saveSubscription` to use internal Firestore wrapper instead of direct Firebase imports.

## [4.0.28] - 2025-12-01
### Added
- Added `exports` field to package.json for explicit module resolution support.

### Changed
- Updated `@sentry/browser` from pinned `10.11.0` to `^10.27.0`.
- Updated `firebase` from `^12.3.0` to `^12.6.0`.
- Updated `prepare-package` dev dependency from `^1.2.2` to `^1.2.5`.

## [4.0.0] - 2025-09-11
### ⚠️ BREAKING
- Updated to ITW 3.0 standard.

### Added
- Updated `@sentry/browser` to `10.11.0` to avoid breaking changes in `10.12.0` that affect Ultimate-Jekyll.
  > When installing from NPM:
  > lighthouse → @sentry/node@9.46.0 → @sentry/core@9.46.0
  > web-manager → @sentry/browser@10.15.0 → expects
  > @sentry/core@10.15.0

## [3.2.74] - 2025-07-17
### Added
- Now looks for `build.json` in the `/@output/build/` directory to ensure it works with Vite's output structure.

## [1.0.0] - 2024-06-19
### Added
- Initial release of the project 🚀
