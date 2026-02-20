import { getTypedSpecifier } from './getTypedSpecifier';

describe('getTypedSpecifier', () => {
  it('returns function for constant identity', () => {
    const input = { some: 'value' };

    const actualOutput = getTypedSpecifier()(input);

    expect(actualOutput).toBe(input);
  });
});
