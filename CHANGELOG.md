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
