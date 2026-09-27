# Contributing

Thanks for improving `sillar-data-grid`.

## Development

```bash
npm ci
npm run typecheck
npm test
npm run check
```

## Component Quality

- Keep keyboard navigation predictable and documented.
- Preserve accessible names, roles, focus states, and screen reader behavior.
- Test sorting, filtering, pagination, row selection, and responsive rendering when changing grid behavior.
- Keep CSS theme tokens readable in light and dark mode.
- Avoid runtime dependencies unless they clearly reduce risk or complexity.

## Release Readiness

Before publishing, run:

```bash
npm run check
```

The package should remain typed, accessible, SSR-friendly, and small enough for real applications.
