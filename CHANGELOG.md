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
