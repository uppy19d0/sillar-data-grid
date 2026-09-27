# Security Policy

Thank you for helping keep `sillar-data-grid` safe for production applications.

## Supported Versions

Security fixes are prepared for the latest published minor version while the package is below 1.0.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Reporting a Vulnerability

Please do not open a public issue for a vulnerability. Report security concerns through GitHub private vulnerability reporting when available, or contact the maintainer from the npm package metadata.

Include:

- Package version, React version, and runtime environment.
- A minimal reproduction or affected component state.
- Expected impact, especially for accessibility, keyboard interaction, SSR, or user-provided cell content.

## Supply Chain

Releases are checked with TypeScript, build output generation, accessibility-focused tests, and `npm pack --dry-run`. Release tags publish with npm provenance from GitHub Actions.
