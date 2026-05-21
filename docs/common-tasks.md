# Common Tasks

## Adding a New Utility Function

1. Add function to `src/modules/utilities.js`
2. Export it: `export function myFunction() { ... }`
3. Update README.md with documentation
4. Run `npm run prepare` to build

## Adding a New Module

1. Create `src/modules/my-module.js`
2. Export class: `export default class MyModule { constructor(manager) { ... } }`
3. Import in `src/index.js`: `import MyModule from './modules/my-module.js'`
4. Add to Manager constructor: `this._myModule = new MyModule(this)`
5. Add getter: `myModule() { return this._myModule; }`
6. Update README.md
7. Run `npm run prepare`

## Modifying Configuration Defaults

1. Edit `_processConfiguration()` in `src/index.js`
2. Add to `defaults` object (e.g., `payment: { processors: {}, products: [] }`)
3. Document in README.md Configuration section

## Payment Configuration

Payment config shape mirrors OMEGA (the SSOT) — same key names used in BEM, UJM, and EM:
- `processors`: Stripe, PayPal, Chargebee, Coinbase (publishable keys / client IDs)
- `products`: Array of `{ id, name, type, limits: { feature: N }, prices, trial, paypal, stripe, chargebee }` — used to resolve usage limits on the frontend AND drive checkout flows

## Adding a Data Binding Action

1. Edit `_executeAction()` in `src/modules/bindings.js`
2. Add case for new action (e.g., `@class`)
3. Document in README.md Data Binding section
