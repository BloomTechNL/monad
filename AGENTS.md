# Working in this repository

- Work directly on `main` with small, self-contained commits. Push to `main` to run CI. Releases are dispatched separately.
- Use Prettier for formatting and ESLint for linting. Run `pnpm format` to apply formatting and `pnpm format:check` to verify it. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before pushing.
- Follow the existing ESM TypeScript style. Use explicit type-only imports. Keep the package free of runtime dependencies and Node.js-specific APIs. Each monad has its own entry point (`/optional`, `/result`); the root entry point re-exports both.

## Commit messages and releases

Use Conventional Commits in the form `type(scope): short imperative summary`. Scope is optional. Commit types do not decide the version.

## Installing and changing dependencies

- Run `npm run deps:install` to validate and audit the frozen lockfile before installing. This runs Husky setup explicitly after installing with lifecycle scripts disabled.
- For dependency changes, resolve with `pnpm add --lockfile-only --ignore-scripts <package>` or `pnpm update --lockfile-only --ignore-scripts <package>`, then run `npm run deps:install`. Use npm only to invoke repository scripts. Avoid plain install or add commands, which can install packages before the advisory check.

## Releasing

Releases are manual and go through GitHub Actions only. Never run `npm publish` locally.

1. Bump `version` in `package.json` using semver (patch for fixes, minor for features, major for breaking changes) and commit it as `chore: release <version>`.
2. Push to `main` and wait for **CI and npm release** to pass. A push never publishes.
3. In GitHub, open Actions, **CI and npm release**, **Run workflow** on `main`, and enter the exact version. Or run `gh workflow run release.yml --ref main -f version=<version>`.
4. The workflow publishes the tarball built in that run with provenance, then pushes `v<version>`. Verify with `npm view @bloom-group/monad dist-tags` and the tag on GitHub. npm can take a minute to show the new version.

The run fails before publishing if the input differs from `package.json`, or if the run is not on `main`. npm rejects a version that already exists. If the publish succeeded and the tag job failed, rerun the failed job or push `v<version>` for the published commit by hand.

## npm and GitHub setup

The package is already published and these settings are in place. Keep them:

1. In GitHub, the `npm-release` environment has no required reviewers, so dispatching the workflow publishes without approval. Only maintainers with write access can dispatch it. The workflow itself refuses to publish from any branch other than `main`.
2. In npm, the trusted publisher uses owner `BloomTechNL`, repository `monad`, workflow `release.yml`, environment `npm-release`, and **Allow `npm publish`** enabled. The environment binding is required so a workflow change cannot obtain npm publishing access by omitting the environment. [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
3. In GitHub repository settings, require actions to be pinned to a full-length commit SHA, and add a ruleset that blocks force-pushes and deletion on `main` and protects `v*` tags. Pin new or updated actions as `owner/repo@<sha> # <tag>`.
