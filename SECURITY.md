# Security policy

## Supported versions

Only the latest release of `@bloom-group/monad` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue for security problems. Report them privately through [GitHub's private vulnerability reporting](https://github.com/BloomTechNL/monad/security/advisories/new) instead.

We aim to acknowledge reports within a few working days and will keep you informed while we work on a fix.

## Verifying releases

Every release is published from GitHub Actions with npm provenance. You can verify installed packages with:

```sh
npm audit signatures
```
