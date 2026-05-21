# Dependencies & Important Notes

## Dependencies

| Package | Purpose |
|---------|---------|
| `firebase` (^12.x) | Auth, Firestore, Messaging |
| `@sentry/browser` (^10.x) | Error tracking |
| `lodash` (^4.x) | get/set for path-based access |
| `itwcw-package-analytics` | Analytics (internal) |

## Important Notes

1. **DO NOT MODIFY `_legacy/`** — Reference only for historical context
2. **Backwards compatibility is NOT required** — Just change to the new way
3. **Prefer `fs-jetpack`** over `fs` for any file operations in tests/scripts
4. **No TypeScript** — This is a pure JavaScript library
5. **Template strings** — Use backticks for string interpolation
6. **Modular design** — Keep modules focused and small
