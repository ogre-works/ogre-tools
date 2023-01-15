import pipeline from '../../../doings/pipeline/pipeline';
import asArray from '../../pullers/asArray/asArray';
import take from '../../slackers/take/take';
import infinity from './infinity';

describe('infinity', () => {
  it('given no function call, iterates to infinite number of undefined values', () => {
    const actual = pipeline(infinity, take(3), asArray);

    expect(actual).toEqual([undefined, undefined, undefined]);
  });

  it('given no parameters, generates infinite number of undefined values', () => {
    const actual = pipeline(infinity(), take(3), asArray);

    expect(actual).toEqual([undefined, undefined, undefined]);
  });

  it('given seed, generates infinite number of seeds', () => {
    const actual = pipeline(infinity('some-seed'), take(3), asArray);

    expect(actual).toEqual(['some-seed', 'some-seed', 'some-seed']);
  });

  it('given seed and function, generates infinite number values starting from seed and then accumulating it using function', () => {
    const actual = pipeline(infinity(2, acc => acc * 2), take(3), asArray);

    expect(actual).toEqual([2, 4, 8]);
  });
});
