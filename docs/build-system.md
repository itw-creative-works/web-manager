# Build System

## prepare-package

The library uses `prepare-package` for ES5 transpilation:

```json
{
  "preparePackage": {
    "input": "./src",
    "output": "./dist"
  }
}
```

**Commands**:
- `npm run prepare` — Build once
- `npm start` — Watch mode
- `npm test` — Run Mocha tests

## Package Exports

```json
{
  "main": "dist/index.js",
  "module": "src/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./modules/*": "./dist/modules/*"
  }
}
```
