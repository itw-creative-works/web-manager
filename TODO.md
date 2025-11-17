BRING BACK THESE THINGS FROM LEGACY:
- Add back build.json fetch

Do we need to use polyfill? the project that consumes this  is using webpack and compiles to es5. we need to ensure we have
- fetch api
- promises
- async


UTM management

LOCALSTORAGE

WRAPPERS FOR COMMON FUNCITONS LIKE FIRESTORE DOC READ and QUERY AND WRITE

// Chrome extension Sentry integration
// Extract only the functions we need (enables tree-shaking)
// This is REQUIRED for browser extensions to avoid bundling the entire Sentry SDK
// https://github.com/getsentry/sentry-javascript/issues/14010
const {
  init,
  captureException,
  browserTracingIntegration,
  replayIntegration,
  browserApiErrorsIntegration,
  breadcrumbsIntegration,
  globalHandlersIntegration,
} = module;

// Store references
this.Sentry = {
  init,
  captureException,
  browserTracingIntegration,
  replayIntegration,
  browserApiErrorsIntegration,
  breadcrumbsIntegration,
  globalHandlersIntegration,
};

// Expose limited API globally (only what's needed)
window.Sentry = this.Sentry;
