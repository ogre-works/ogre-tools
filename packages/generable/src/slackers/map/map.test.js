import pipeline from '../../../doings/pipeline/pipeline';
import asArray from '../../pullers/asArray/asArray';
import asAsync from '../asAsync/asAsync';
import map from './map';

describe('map', () => {
  it('given a mapping function and synchronous iterable, returns new synchronous iterable for mapped values', () => {
    const mappingFunction = x => x * 2;

    const synchronousIterable = [1, 2];

    const iterableForMappedValues = map(mappingFunction, synchronousIterable);

    const iterator = iterableForMappedValues[Symbol.iterator]();

    const iterations = [iterator.next(), iterator.next(), iterator.next()];

    expect(iterations).toEqual([
      { value: 2, done: false },
      { value: 4, done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given a mapping function and asynchronous iterable, returns new asynchronous iterable for mapped values', async () => {
    const mappingFunction = x => x * 2;

    const asynchronousIterable = (async function*() {
      yield 1;
      yield await 2;
      yield Promise.resolve(3);
    })();

    const iterableForMappedValues = map(mappingFunction)(asynchronousIterable);

    const iterator = iterableForMappedValues[Symbol.asyncIterator]();

    const iterations = [
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
      await iterator.next(),
    ];

    expect(iterations).toEqual([
      { value: 2, done: false },
      { value: 4, done: false },
      { value: 6, done: false },
      { value: undefined, done: true },
    ]);
  });

  it('given a non-function instead of mapping function, when mapping sync iterable, maps static non-function', () => {
    const iterable = [1, 2, 3];

    const actual = pipeline(iterable, map('some-non-function'), asArray);

    expect(actual).toEqual([
      'some-non-function',
      'some-non-function',
      'some-non-function',
    ]);
  });

  it('given a non-function instead of mapping function, when mapping async iterable, maps static non-function', async () => {
    const iterable = asAsync([1, 2, 3]);

    const actual = await pipeline(iterable, map('some-non-function'), asArray);

    expect(actual).toEqual([
      'some-non-function',
      'some-non-function',
      'some-non-function',
    ]);
  });

  it('given an async mapping function, when mapping sync iterable, maps the async values', async () => {
    const asyncMappingFunction = async x => x * 2;
    const syncIterable = [1, 2, 3];

    const actual = await pipeline(
      syncIterable,
      map(asyncMappingFunction),
      asArray,
    );

    expect(actual).toEqual([2, 4, 6]);
  });

  it('given an async mapping function, when mapping async iterable, maps the async values', async () => {
    const asyncMappingFunction = async x => x * 2;
    const syncIterable = asAsync([1, 2, 3]);

    const actual = await pipeline(
      syncIterable,
      map(asyncMappingFunction),
      asArray,
    );

    expect(actual).toEqual([2, 4, 6]);
  });
});
