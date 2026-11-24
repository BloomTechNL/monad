# Monad

Optional and Result monads for TypeScript.

`@bloom-group/monad` gives you two small, chainable types:

- **`Optional<T>`** is a value that may be missing. Use it instead of `null` and `undefined` checks.
- **`Result<T, E>`** is either a success value or a typed error. Use it instead of throwing.

## Installation

```bash
npm install @bloom-group/monad
```

The package is ESM-only and has no runtime dependencies. Import from the root, or from `@bloom-group/monad/optional` or `@bloom-group/monad/result` to pull in one monad.

## Optional

An `Optional<T>` is a `Present<T>`, which holds a value, or a `Missing<T>`, which doesn't.

```ts
import {
  Missing,
  Present,
  toOptional,
  type Optional,
} from '@bloom-group/monad';

const present: Optional<number> = new Present(42);
const missing: Optional<number> = new Missing();

const fromNullable = toOptional(map.get(key)); // null or undefined become Missing
```

### Chaining

`map` and `flatMap` run only when a value is present, so a chain of lookups stops at the first missing one:

```ts
const street = findUser(userId)
  .flatMap((user) => findAddress(user.addressId))
  .map((address) => address.street);
```

### Getting the value out

```ts
if (street.isPresent()) {
  street.value; // string
}

street.fillMissing('unknown'); // Present<string>, using the fallback when missing
street.thisOrFill(lookupElsewhere()); // this Optional, or the fallback Optional when missing
street.throwIfMissing(); // string, or throws when missing

toUndefined(street); // string | undefined
toNull(street); // string | null

assertPresent(street); // narrows to Present<string>, or throws when missing
```

## Result

A `Result<T, E>` is an `Ok<T, E>`, which holds a value, or an `Err<T, E>`, which holds an error.

```ts
import { Err, Ok, type Result } from '@bloom-group/monad';

type ParseError = 'invalid-format' | 'out-of-range';

function parseAge(input: string): Result<number, ParseError> {
  const age = Number.parseInt(input, 10);
  if (Number.isNaN(age)) return new Err('invalid-format');
  if (age < 0 || age > 150) return new Err('out-of-range');
  return new Ok(age);
}
```

### Chaining

`map` and `flatMap` run only on an `Ok`; an `Err` passes through unchanged. `errMap` transforms the error instead.

```ts
const result = parseAge(input)
  .map((age) => ({ age, isAdult: age >= 18 }))
  .errMap((error) => new Error(`Invalid age: ${error}`));
```

`Ok` also has `asyncFlatMap` for an async next step. Narrow with `isOk()` first:

```ts
const age = parseAge(input);
if (age.isOk()) {
  const users = await age.asyncFlatMap((value) => fetchUsersByAge(value));
}
```

### Getting the value out

```ts
if (result.isOk()) result.value; // the ok value
if (result.isErr()) result.value; // the error

result.throw(); // the ok value, or throws the error as-is

const age = parseAge(input).throwAs(
  'out-of-range',
  new RangeError('Age out of range'),
);
// age: Result<number, 'invalid-format'>

assertOk(result); // narrows to Ok, or throws
assertErr(result); // narrows to Err, or throws
```

`throwAs(error, throwable)` throws `throwable` when the result is that specific error, and removes it from the error type otherwise.

### Combining results

`collectResults` turns a list of results into a result of a list, stopping at the first error:

```ts
collectResults([new Ok(1), new Ok(2)]); // Ok([1, 2])
collectResults([new Ok(1), new Err('bad')]); // Err('bad')
```

## API

| Export                 | Entry point | Description                                              |
| ---------------------- | ----------- | -------------------------------------------------------- |
| `Optional<T>`          | `/optional` | `Present<T> \| Missing<T>`                               |
| `Present`, `Missing`   | `/optional` | The two cases of `Optional`                              |
| `toOptional(value)`    | `/optional` | `Missing` for `null` or `undefined`, otherwise `Present` |
| `toUndefined(opt)`     | `/optional` | The value, or `undefined`                                |
| `toNull(opt)`          | `/optional` | The value, or `null`                                     |
| `assertPresent(opt)`   | `/optional` | Narrows to `Present`, or throws                          |
| `Result<T, E>`         | `/result`   | Implemented by `Ok<T, E>` and `Err<T, E>`                |
| `Ok`, `Err`            | `/result`   | The two cases of `Result`; `Ok.empty()` is `Ok<void>`    |
| `pure(value)`          | `/result`   | `new Ok(value)` typed as `Result`                        |
| `assertOk(result)`     | `/result`   | Narrows to `Ok`, or throws                               |
| `assertErr(result)`    | `/result`   | Narrows to `Err`, or throws                              |
| `collectResults(list)` | `/result`   | `Result<T, E>[]` to `Result<T[], E>`                     |

Everything is also exported from the root entry point.

## Contributing and releases

Use `npm run deps:install` to install (it audits the frozen lockfile first and installs without lifecycle scripts), and run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` before pushing to `main`. Releases are published from GitHub Actions with provenance: bump `version` in `package.json`, push to `main`, then run **CI and npm release** with that version. See [AGENTS.md](AGENTS.md) for the full process and settings.

## License

MIT
