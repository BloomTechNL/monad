export class Missing<T> {
  public readonly value: null = null;

  isMissing(): this is Missing<T> {
    return true;
  }

  isPresent(): this is Present<T> {
    return false;
  }

  flatMap<U>(_f: (value: T) => Optional<U>): Optional<U> {
    return this as unknown as Optional<U>;
  }

  map<U>(_f: (value: T) => U): Optional<U> {
    return this as unknown as Optional<U>;
  }

  fillMissing(value: T): Present<T> {
    return new Present(value);
  }

  thisOrFill(value: Optional<T>): Optional<T> {
    return value;
  }

  throwIfMissing(): T {
    throw new Error('Called throwIfMissing on None');
  }
}

export class Present<T> {
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isMissing(): this is Missing<T> {
    return false;
  }

  isPresent(): this is Present<T> {
    return true;
  }

  flatMap<U>(f: (value: T) => Optional<U>): Optional<U> {
    return f(this.value);
  }

  map<U>(f: (value: T) => U): Optional<U> {
    return new Present(f(this.value));
  }

  fillMissing(_defaultValue: T): this {
    return this;
  }

  thisOrFill(_defaultValue: Optional<T>): Optional<T> {
    return this;
  }

  throwIfMissing(): T {
    return this.value;
  }
}

export type Optional<T> = Missing<T> | Present<T>;

export function assertPresent<T>(
  value: Optional<T>,
): asserts value is Present<T> {
  if (value instanceof Missing) {
    throw new Error('Expected Some but got None');
  }
}

export function toOptional<T>(value?: T | null): Optional<T> {
  if (value === null || value === undefined) return new Missing();
  return new Present(value);
}

export function toUndefined<T>(value: Optional<T>): T | undefined {
  if (!value.isPresent()) return undefined;
  return value.value;
}

export function toNull<T>(value: Optional<T>): T | null {
  return value.value;
}
