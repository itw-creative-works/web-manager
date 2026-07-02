# CDP Debugging (driving a live browser)

How to drive a browser you can CONTROL — see a consuming site live, screenshot it, click, type, read console logs, inspect network requests — for agents (Claude via MCP/CDP) and humans. WM has no dev server of its own; it runs INSIDE consumers (UJM sites, BXM extensions, EM renderers), so browser verification means driving a consumer.

> Mirrored across the five sister frameworks (UJM / BEM / BXM / EM / WM) — same core section, framework-flavored. Edit all five together.

## The browser: your Claude session owns one

Browser work runs through the **`chrome-devtools` MCP** (via mcp-router). There is NO launch procedure anymore — no ports, no profile dirs, no curl checks:

- **Just call the tools** — `new_page`, `navigate_page`, `take_screenshot`, `click`, `fill`, `evaluate_script`, `list_console_messages`, `list_network_requests`. The browser auto-launches on the first call.
- **Each Claude session gets its OWN private Chrome** (`--isolated`): temp profile, CDP over an internal pipe. Parallel sessions cannot see or touch each other's pages — open and close pages freely, the whole browser is yours.
- **It dies with the session.** No orphans, no cleanup, nothing to kill.
- **Ephemeral profile** — cookies/logins do NOT persist between sessions. If a flow needs auth, log in during the task.
- **Self-signed HTTPS is pre-accepted** (`--acceptInsecureCerts` in the upstream) — dev servers load without certificate interstitials.
- **NEVER quit/kill Chrome by app name** (`killall "Google Chrome"`, osascript) — that's the user's personal browser, not yours.

Humans: the agent's Chrome window is visible — you can watch it drive. Full reference: `~/.claude/mcp-server/servers/chrome-devtools/CLAUDE.md`.

## Electron apps are the exception (attach, don't launch)

An Electron dev app is a running singleton — you ATTACH to it instead of launching a browser: the `chrome-devtools-electron` MCP upstream (reads `EM_CDP_PORT`, default 9222, expanded once at session start) or EM's per-invocation `npx mgr cdp`. See EM's `docs/cdp-debugging.md`.

## WM specifics

- **Verify WM behavior through a consumer.** The usual host is a UJM site's dev server: **`https://localhost:4000` — NEVER the LAN IP** (`https://192.168.x.x:...`); port 4000 by default, increments (4001, …) when multiple sites run — exact port in the WEBSITE project's `.temp/_config_browsersync.yml`. To test uncommitted WM changes, link the local web-manager into the consumer first (see the consumer framework's dev-install flow), then drive the site.
- What to exercise from the browser: auth flows (`webManager.auth()` states, the Settler Pattern), `data-wm-bind` bindings reacting to state changes (`evaluate_script` to mutate state, `take_snapshot`/`take_screenshot` to verify DOM), Firestore reads/writes on the network tab, and console cleanliness (WM logs its module lifecycle).
- Ephemeral profile ⇒ auth'd testing means logging in through the consumer's real UI at the start of the session (test creds).
- WM inside a BXM extension or EM renderer: drive those through their own surfaces — BXM's `chrome-devtools-extension` upstream, EM's `chrome-devtools-electron`/`mgr cdp` (see those repos' `docs/cdp-debugging.md`).
