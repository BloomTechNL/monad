import { describe, it, expect, beforeEach } from 'vitest';
import { Missing, Present, type Optional, assertPresent } from './optional.js';

describe('Missing', () => {
  let missing: Missing<number>;

  beforeEach(() => {
    missing = new Missing<number>();
  });

  it('should have null value', () => {
    expect(missing.value).toBe(null);
  });

  it('should return true for isMissing', () => {
    expect(missing.isMissing()).toBe(true);
  });

  it('should return false for isPresent', () => {
    expect(missing.isPresent()).toBe(false);
  });

  it('should return Missing when map is called', () => {
    const result = missing.map((x) => x * 2);
    expect(result.isMissing()).toBe(true);
  });

  it('should return Missing when flatMap is called', () => {
    const result = missing.flatMap((x) => new Present(x * 2));
    expect(result.isMissing()).toBe(true);
  });

  it('should return default value when withDefault is called', () => {
    const result = missing.fillMissing(42);
    expect(result.value).toBe(42);
  });

  it('should throw error when throwIfMissing is called', () => {
    expect(() => missing.throwIfMissing()).toThrow(
      'Called throwIfMissing on None',
    );
  });
});

describe('Present', () => {
  let present: Present<number>;

  beforeEach(() => {
    present = new Present(10);
  });

  it('should store the provided value', () => {
    expect(present.value).toBe(10);
  });

  it('should return false for isMissing', () => {
    expect(present.isMissing()).toBe(false);
  });

  it('should return true for isPresent', () => {
    expect(present.isPresent()).toBe(true);
  });

  it('should apply function and return new Present when map is called', () => {
    const result = present.map((x) => x * 2);
    expect(result.isPresent()).toBe(true);
    if (result.isPresent()) {
      expect(result.value).toBe(20);
    }
  });

  it('should apply function and return result when flatMap is called with Present', () => {
    const result = present.flatMap((x) => new Present(x * 2));
    expect(result.isPresent()).toBe(true);
    if (result.isPresent()) {
      expect(result.value).toBe(20);
    }
  });

  it('should return Missing when flatMap is called with Missing', () => {
    const result = present.flatMap(() => new Missing<number>());
    expect(result.isMissing()).toBe(true);
  });

  it('should return stored value when withDefault is called', () => {
    const result = present.fillMissing(42);
    expect(result.value).toBe(10);
  });

  it('should return stored value when throwIfMissing is called', () => {
    const result = present.throwIfMissing();
    expect(result).toBe(10);
  });

  it('should handle map with type transformation', () => {
    const result = present.map((x) => `value: ${String(x)}`);
    expect(result.isPresent()).toBe(true);
    if (result.isPresent()) {
      expect(result.value).toBe('value: 10');
    }
  });

  it('should handle flatMap with type transformation', () => {
    const result = present.flatMap((x) => new Present(`value: ${String(x)}`));
    expect(result.isPresent()).toBe(true);
    if (result.isPresent()) {
      expect(result.value).toBe('value: 10');
    }
  });
});

describe('assertPresent', () => {
  it('should not throw when given a Present', () => {
    const present = new Present(42);
    expect(() => {
      assertPresent(present);
    }).not.toThrow();
  });

  it('should throw when given a Missing', () => {
    const missing = new Missing<number>();
    expect(() => {
      assertPresent(missing);
    }).toThrow('Expected Some but got None');
  });

  it('should narrow type after assertion', () => {
    const optional: Optional<number> = new Present(42);
    assertPresent(optional);
    // After assertion, TypeScript knows optional is Present<number>
    expect(optional.value).toBe(42);
  });
});

describe('Optional chaining', () => {
  it('should chain multiple map operations on Present', () => {
    const result = new Present(5)
      .map((x) => x * 2)
      .map((x) => x + 3)
      .map((x) => `result: ${String(x)}`);

    expect(result.isPresent()).toBe(true);
    if (result.isPresent()) {
      expect(result.value).toBe('result: 13');
    }
  });

  it('should chain multiple map operations on Missing', () => {
    const result = new Missing<number>()
      .map((x) => x * 2)
      .map((x) => x + 3)
      .map((x) => `result: ${String(x)}`);

    expect(result.isMissing()).toBe(true);
  });

  it('should chain flatMap operations on Present', () => {
    const result = new Present(5)
      .flatMap((x) => new Present(x * 2))
      .flatMap((x) => new Present(x + 3));

    expect(result.isPresent()).toBe(true);
    if (result.isPresent()) {
      expect(result.value).toBe(13);
    }
  });

  it('should short-circuit on Missing in flatMap chain', () => {
    const result = new Present(5)
      .flatMap((x) => new Present(x * 2))
      .flatMap(() => new Missing<number>())
      .flatMap((x) => new Present(x + 3));

    expect(result.isMissing()).toBe(true);
  });
});
