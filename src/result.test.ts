import { Err, Ok, type Result, pure } from './result.js';
import { describe, it, expect } from 'vitest';

describe('Result', () => {
  it('is functorial in the ok argument', () => {
    function f(value: string): number {
      return value.length;
    }

    const okOutcome = new Ok('shibby').map(f);
    expect(okOutcome).toEqual(new Ok(f('shibby')));

    const errOutcome = new Err<string, number>(9).map(f);
    expect(errOutcome).toEqual(new Err(9));
  });

  it('is functorial in the err argument', () => {
    function f(value: string): number {
      return value.length;
    }

    const okOutcome = new Err('shibby').errMap(f);
    expect(okOutcome).toEqual(new Err(f('shibby')));

    const errOutcome = new Ok<number, string>(9).errMap(f);
    expect(errOutcome).toEqual(new Ok(9));
  });

  it('admits an associative flatMap', () => {
    function f(arg: string): Result<number, boolean> {
      return new Ok(arg.length);
    }

    const okResult = new Ok<string, boolean>('shibby');
    const okOutcome: Result<number, boolean> = okResult.flatMap(f);
    expect(okOutcome).toEqual(new Ok(6));

    const errResult = new Err<string, boolean>(false);
    const errOutcome: Result<number, boolean> = errResult.flatMap(f);
    expect(errOutcome).toEqual(new Err(false));
  });

  it('admits a pure operation which is an identity element for flatmap', () => {
    const pureResult = pure('test');
    expect(pureResult).toEqual(new Ok('test'));
  });

  it('throws an error when asked to', () => {
    const result = new Ok(3);
    expect(result.throw()).toEqual(3);

    const err = new Err(new Error('some error'));
    expect(() => err.throw()).toThrow('some error');
  });
});
