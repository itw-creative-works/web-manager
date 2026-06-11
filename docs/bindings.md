# Bindings (`data-wm-bind`)

The `data-wm-bind` attribute declaratively binds DOM elements to state data (auth, plan, roles, usage, custom state) managed by `webManager.bindings()`. **Always prefer wm-bindings over manual JS class toggling** for anything based on user/auth state — if an element's visibility or content depends on the user object, use `data-wm-bind` in HTML, not `classList.toggle('d-none', ...)` or `.hidden` from JS.

## HTML Syntax

```html
<element data-wm-bind="@action path.to.data"></element>
```

### Multiple Bindings: MUST Use Commas

Multiple bindings are **comma-separated**. The parser splits by comma first, then parses each part as `@action expression`.

```html
<!-- CORRECT: comma-separated -->
<element data-wm-bind="@show auth.user, @attr src auth.user.photoURL"></element>

<!-- WRONG: space-separated — gets parsed as ONE binding with action=@show, expression="auth.user @attr src auth.user.photoURL" -->
<element data-wm-bind="@show auth.user @attr src auth.user.photoURL"></element>
```

**Why this matters:** The parser splits on `,` then finds the first space within each part to separate `@action` from `expression`. Without commas, everything after the first `@action` is treated as a single expression string, producing broken behavior with no error.

## Supported Actions

| Action | Syntax | Description |
|--------|--------|-------------|
| `@text` | `@text path` | Set text content |
| `@value` | `@value path` | Set input/textarea value |
| `@show` | `@show condition` | Show element if truthy |
| `@hide` | `@hide condition` | Hide element if truthy |
| `@attr` | `@attr name path` | Set HTML attribute value |
| `@style` | `@style property path` | Set CSS property or CSS variable |

## Condition Operators

```html
<!-- Truthy check -->
<div data-wm-bind="@show auth.user">Visible when logged in</div>

<!-- Negation (!) -->
<div data-wm-bind="@show !auth.user">Visible when NOT logged in</div>

<!-- Comparisons (===, !==, ==, !=, >, <, >=, <=) -->
<div data-wm-bind="@show auth.account.plan.id === 'premium'">Premium only</div>
<div data-wm-bind="@show checkout.errorCount > 0">Has errors</div>
```

No logic operators (`&&`, `||`) in conditions — keep conditions simple. Right-side comparison values are auto-parsed: quoted strings, numbers, booleans, null.

## Common Auth Patterns

```html
<!-- Show for anonymous users -->
<div data-wm-bind="@show !auth.user">
  <a href="/signup">Create free account</a>
</div>

<!-- Show for signed-in users -->
<div data-wm-bind="@show auth.user">
  <a href="/pricing">Upgrade your plan</a>
</div>

<!-- Admin-only elements -->
<div data-wm-bind="@show auth.account.roles.admin">Admin panel</div>

<!-- User data binding -->
<img data-wm-bind="@show auth.user, @attr src auth.user.photoURL, @attr alt auth.user.displayName">
<span data-wm-bind="@text auth.user.displayName">Loading...</span>
<input data-wm-bind="@value auth.user.email">
```

## Available State Paths

### Auth paths (automatically populated by web-manager)

```
auth.user                        # Firebase user object (truthy = signed in)
auth.user.uid                    # User ID
auth.user.email                  # Email
auth.user.displayName            # Display name
auth.user.photoURL               # Avatar URL
auth.user.emailVerified          # Boolean
auth.account.plan.id             # Plan ID (e.g. 'basic', 'premium')
auth.account.roles.admin         # Boolean
auth.account.roles.betaTester    # Boolean
```

### Usage paths (auto-populated by web-manager + authorized-fetch)

```
usage.{feature}.monthly              # Current monthly usage count
usage.{feature}.daily                # Current daily usage count
usage.{feature}.limit                # Plan limit for this feature
```

Example: `usage.credits.monthly`, `usage.credits.limit`

Seeded on auth settle from `account.usage` + the site's payment plan config. Refreshed after every `authorizedFetch` call from `bm-properties` response headers.

### Custom state (set via JS)

Any custom paths set via `webManager.bindings().update(stateObject)`.

## JavaScript API

```javascript
// Update bindings with state data
webManager.bindings().update({
  checkout: {
    product: { name: 'Pro Plan' },
    error: { show: false, message: '' },
  },
});

// Get current binding context
const context = webManager.bindings().getContext();

// Clear all bindings
webManager.bindings().clear();
```

## Skeleton Loaders

### How Skeletons Work

The `wm-binding-skeleton` class shows a shimmer animation until data loads. Skeletons resolve **only when at least one of the element's bindings is actually processed** — meaning the binding's root key must be in the `updatedKeys` for that `update()` call.

When `_updateBindings` processes an element:

1. Executes each binding action (`@text`, `@show`, `@attr`, etc.)
2. Each action returns `true` (processed) or `false` (skipped because root key wasn't updated)
3. **Only if at least one action was processed:** adds `wm-bound` class (triggers CSS fade-out transition)
4. After 300ms, removes `wm-binding-skeleton` class (shimmer disappears)

**Root key scoping matters for skeletons.** If an element is bound to `checkout.pricing.total` and `update({ auth: ... })` fires, that element's skeleton is NOT resolved — the binding is skipped entirely because `checkout` is not in `updatedKeys`.

```html
<!-- Skeleton resolves when 'auth' key is updated -->
<span class="wm-binding-skeleton" data-wm-bind="@text auth.user.displayName">&nbsp;</span>

<!-- Skeleton resolves when 'checkout' key is updated (NOT when 'auth' updates) -->
<span class="wm-binding-skeleton" data-wm-bind="@text checkout.pricing.total">&nbsp;</span>
```

### Multi-phase binding example (e.g., checkout page)

When bindings fire in phases, skeletons resolve independently per root key:

```javascript
// Phase 1: Global auth bindings fire
webManager.bindings().update({ auth: { user: {...} } });
// → Only elements bound to 'auth.*' resolve their skeletons
// → Elements bound to 'checkout.*' keep their skeletons

// Phase 2: After API fetches complete
webManager.bindings().update({ checkout: { pricing: {...} } });
// → Now elements bound to 'checkout.*' resolve their skeletons
```

This prevents checkout skeletons from disappearing prematurely when global auth bindings fire before checkout data is available.

### Skeleton Pattern

Use `&nbsp;` as placeholder content (prevents zero-width collapse so the shimmer is visible):

```html
<span class="wm-binding-skeleton" data-wm-bind="@text auth.user.displayName">&nbsp;</span>
```

**Do NOT use text like "Loading..." as placeholder** — it flashes visible text before the shimmer kicks in. Use `&nbsp;` for a clean shimmer-only experience.

### Composite Text in Skeletons

For composite text (e.g., "$0.00 due today"), do NOT mix static text with a binding span inside a skeleton div. Instead, create a dedicated pre-formatted value in the state and bind with a single `@text`:

```javascript
// CORRECT: compose the text in JS, bind as single value
webManager.bindings().update({
  checkout: {
    totalDueText: `${formatCurrency(prices.total)} due today`,
  },
});
```

```html
<!-- CORRECT: single binding for composite text -->
<span class="wm-binding-skeleton" data-wm-bind="@text checkout.totalDueText">&nbsp;</span>

<!-- WRONG: mixing static text with binding inside skeleton -->
<span class="wm-binding-skeleton">
  <span data-wm-bind="@text checkout.pricing.total"></span> due today
</span>
```

## Implementation Notes

- Uses the `hidden` attribute for show/hide (`[hidden] { display: none !important; }`)
- Queries `[data-wm-bind]` on each `update()` call — handles dynamic elements
- Auth bindings are auto-populated when `webManager.auth().listen()` fires
- When `updatedKeys` is `null` (e.g., from `clear()`), ALL bindings fire

### Root Key Update Filtering

`_shouldUpdatePath` checks the **root key** (first segment before `.`) of each binding's expression path against the `updatedKeys` from the `update()` call. A binding only fires when its root key was updated.

```javascript
// This update ONLY triggers bindings whose expression starts with 'checkout'
webManager.bindings().update({
  checkout: { pricing: { total: 9.99 } },
});
// Fires: @text checkout.pricing.total, @show checkout.active
// Skips: @text auth.user.displayName (root key is 'auth', not updated)
```

Negation (`!`) is stripped before root-key checking, so `@show !auth.user` fires when `auth` is updated.

## See also

- [modules.md](modules.md) — quick reference for all nine modules
- [architecture.md](architecture.md) — module dependency graph
- `src/modules/bindings.js` — the implementation
