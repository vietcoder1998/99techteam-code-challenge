import { describe, expect, test } from '@jest/globals';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum';

const testCases = [
  { n: 1, expected: 1 },
  { n: 5, expected: 15 },
  { n: 0, expected: 0 },
  { n: -3, expected: 0 },
];

describe('sum_to_n_a', () => {
  testCases.forEach(({ n, expected }) => {
    test(`returns ${expected} for n = ${n}`, () => {
      expect(sum_to_n_a(n)).toBe(expected);
    });
  });
});

describe('sum_to_n_b', () => {
  testCases.forEach(({ n, expected }) => {
    test(`returns ${expected} for n = ${n}`, () => {
      expect(sum_to_n_b(n)).toBe(expected);
    });
  });
});

describe('sum_to_n_c', () => {
  testCases.forEach(({ n, expected }) => {
    test(`returns ${expected} for n = ${n}`, () => {
      expect(sum_to_n_c(n)).toBe(expected);
    });
  });
});