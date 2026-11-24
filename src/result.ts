export class Err<OkValue, ErrValue> implements Result<OkValue, ErrValue> {
  public readonly value: ErrValue;

  constructor(value: ErrValue) {
    this.value = value;
  }

  isOk(): this is Ok<OkValue, ErrValue> {
    return false;
  }

  isErr(): this is Err<OkValue, ErrValue> {
    return true;
  }

  flatMap<OkReturn>(
    _f: (value: OkValue) => Result<OkReturn, ErrValue>,
  ): Result<OkReturn, ErrValue> {
    return this as unknown as Result<OkReturn, ErrValue>;
  }

  map<OkReturn>(_f: (value: OkValue) => OkReturn): Result<OkReturn, ErrValue> {
    return this as unknown as Result<OkReturn, ErrValue>;
  }

  errMap<ErrReturn>(
    f: (value: ErrValue) => ErrReturn,
  ): Err<OkValue, ErrReturn> {
    return new Err(f(this.value));
  }

  throw(): OkValue {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw this.value;
  }

  throwAs<T>(x: T, throwable: unknown): Result<OkValue, Exclude<ErrValue, T>> {
    if ((this.value as unknown) === x) throw throwable;
    return this as unknown as Result<OkValue, Exclude<ErrValue, T>>;
  }
}

export class Ok<OkValue, ErrValue> implements Result<OkValue, ErrValue> {
  public readonly value: OkValue;

  constructor(value: OkValue) {
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static empty(): Ok<void, any> {
    return new Ok(undefined);
  }

  isOk(): this is Ok<OkValue, ErrValue> {
    return true;
  }

  isErr(): this is Err<OkValue, ErrValue> {
    return false;
  }

  flatMap<OkReturn>(
    f: (value: OkValue) => Result<OkReturn, ErrValue>,
  ): Result<OkReturn, ErrValue> {
    return f(this.value);
  }
  map<OkReturn>(f: (value: OkValue) => OkReturn): Result<OkReturn, ErrValue> {
    return new Ok(f(this.value));
  }

  errMap<ErrReturn>(
    _f: (value: ErrValue) => ErrReturn,
  ): Ok<OkValue, ErrReturn> {
    return this as unknown as Ok<OkValue, ErrReturn>;
  }

  async asyncFlatMap<OkReturn>(
    f: (value: OkValue) => Promise<Result<OkReturn, ErrValue>>,
  ): Promise<Result<OkReturn, ErrValue>> {
    return await f(this.value);
  }

  throw(): OkValue {
    return this.value;
  }

  throwAs<T>(
    _x: T,
    _throwable: unknown,
  ): Result<OkValue, Exclude<ErrValue, T>> {
    return this as unknown as Result<OkValue, Exclude<ErrValue, T>>;
  }
}

export interface Result<OkValue, ErrValue> {
  readonly value: OkValue | ErrValue;

  isOk(): this is Ok<OkValue, ErrValue>;
  isErr(): this is Err<OkValue, ErrValue>;

  flatMap<OkReturn>(
    f: (value: OkValue) => Result<OkReturn, ErrValue>,
  ): Result<OkReturn, ErrValue>;
  map<OkReturn>(f: (value: OkValue) => OkReturn): Result<OkReturn, ErrValue>;
  errMap<ErrReturn>(
    f: (value: ErrValue) => ErrReturn,
  ): Result<OkValue, ErrReturn>;
  throw(): OkValue;
  throwAs<T extends ErrValue>(
    x: T,
    throwable: unknown,
  ): Result<OkValue, Exclude<ErrValue, T>>;
}

export function pure<OkValue, ErrValue>(
  value: OkValue,
): Result<OkValue, ErrValue> {
  return new Ok(value);
}

export function assertOk<T, U>(value: Result<T, U>): asserts value is Ok<T, U> {
  if (value instanceof Err) {
    throw new Error(`Expected Ok but got Err: ${JSON.stringify(value.value)}`);
  }
}

export function assertErr<T, U>(
  value: Result<T, U>,
): asserts value is Err<T, U> {
  if (value instanceof Ok) {
    throw new Error(`Expected Err but got Ok: ${JSON.stringify(value.value)}`);
  }
}

export function collectResults<T, S>(
  resultsList: Result<T, S>[],
): Result<T[], S> {
  return resultsList.reduce<Result<T[], S>>(
    (acc, current) => acc.flatMap((arr) => current.map((val) => [...arr, val])),
    new Ok([]),
  );
}
