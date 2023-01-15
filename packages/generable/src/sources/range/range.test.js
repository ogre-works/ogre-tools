import pipeline from '../../../doings/pipeline/pipeline';
import asArray from '../../pullers/asArray/asArray';
import take from '../../slackers/take/take';
import range from './range';

describe('range', () => {
  it('given starting point, generates ascending numbers from starting point', () => {
    const actual = pipeline(range(42), take(3), asArray);

    expect(actual).toEqual([42, 43, 44]);
  });

  it('given starting point and increment, generates numbers from starting point by increment', () => {
    const actual = pipeline(range(42, 2), take(3), asArray);

    expect(actual).toEqual([42, 44, 46]);
  });

  it('given starting point, increment and number of takes, takes numbers from starting point by increment', () => {
    const actual = pipeline(range(42, 2, 3), asArray);

    expect(actual).toEqual([42, 44, 46]);
  });

  it('given no arguments, generates ascending numbers starting from 0', () => {
    const actual = pipeline(range(), take(3), asArray);

    expect(actual).toEqual([0, 1, 2]);
  });

  it('given no function call, generates ascending numbers starting from 0', () => {
    const actual = pipeline(range, take(3), asArray);

    expect(actual).toEqual([0, 1, 2]);
  });
});
