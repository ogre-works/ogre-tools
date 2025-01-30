import { identity } from 'lodash/fp';
import { getTypedSpecifier } from './getTypedSpecifier';

describe('getTypedSpecifier', () => {
  it('is identity, and only relevant for typing', () => {
    expect(getTypedSpecifier).toBe(identity);
  });
});
