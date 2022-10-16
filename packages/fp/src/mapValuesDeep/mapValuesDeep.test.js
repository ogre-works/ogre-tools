import { isArray, isPlainObject, isString, nth, toUpper } from 'lodash/fp';

import mapValuesDeep from './mapValuesDeep';

const stringsToUpperSnakeCase = thing =>
  isString(thing) ? toUpper(thing) : thing;

describe('mapValuesDeep', () => {
  let mapDeepStringsToUppercase;

  beforeEach(() => {
    mapDeepStringsToUppercase = mapValuesDeep(stringsToUpperSnakeCase);
  });

  it('maps flat values', () => {
    const actual = mapDeepStringsToUppercase({ some: 'value' });

    expect(actual).toEqual({ some: 'VALUE' });
  });

  it('maps nested values', () => {
    const actual = mapDeepStringsToUppercase({
      someObject: { some: 'value' },
    });

    expect(actual).toEqual({ someObject: { some: 'VALUE' } });
  });

  it('maps objects in nested arrays', () => {
    const actual = mapDeepStringsToUppercase({
      someObject: { someArray: [{ some: 'value' }] },
    });

    expect(actual).toEqual({
      someObject: { someArray: [{ some: 'VALUE' }] },
    });
  });

  it('maps an array of values', () => {
    const actual = mapDeepStringsToUppercase([
      'some-value',
      'some-other-value',
      { someProperty: 'some-value' },
      { someArray: ['some-value'] },
    ]);

    expect(actual).toEqual([
      'SOME-VALUE',
      'SOME-OTHER-VALUE',
      { someProperty: 'SOME-VALUE' },
      { someArray: ['SOME-VALUE'] },
    ]);
  });

  it('provides path to mapping function', () => {
    const paths = mapValuesDeep((value, path) =>
      isPlainObject(value) || isArray(value) ? value : path.join('.'),
    )({ a: [{ b: 'irrelevant' }] });

    expect(paths).toEqual({ a: [{ b: 'a.0.b' }] });
  });

  it('when mapping an object, provides path to mapping function', () => {
    const mapperMock = jest.fn(x => x);

    mapValuesDeep(mapperMock)({
      a: { b: { c: 'irrelevant', d: 'irrelevant' } },
    });

    expect(mapperMock.mock.calls.map(nth(1))).toEqual([
      [],
      ['a'],
      ['a', 'b'],
      ['a', 'b', 'c'],
      ['a', 'b', 'd'],
    ]);
  });

  it('when mapping an object, provides root object to mapping function', () => {
    const mapperMock = jest.fn(x => x);

    const rootObject = {
      a: { b: { c: 'irrelevant', d: 'irrelevant' } },
    };

    mapValuesDeep(mapperMock)(rootObject);

    expect(mapperMock.mock.calls.map(nth(2))).toEqual([
      rootObject,
      rootObject,
      rootObject,
      rootObject,
      rootObject,
    ]);
  });

  it('when mapping an array, provides path to mapping function', () => {
    const mapperMock = jest.fn(x => x);

    mapValuesDeep(mapperMock)([
      {
        a: { b: ['irrelevant', 'irrelevant'] },
      },
    ]);

    expect(mapperMock.mock.calls.map(nth(1))).toEqual([
      [],
      ['0'],
      ['0', 'a'],
      ['0', 'a', 'b'],
      ['0', 'a', 'b', '0'],
      ['0', 'a', 'b', '1'],
    ]);
  });

  it('when mapping a nested cycle, throws with path for cycle', () => {
    const objectWithCycle = [
      {
        a: { b: ['cycle'] },
      },
    ];

    expect(() => {
      mapValuesDeep(value => (value === 'cycle' ? objectWithCycle : value))({
        someProperty: 'cycle',
      });
    }).toThrow('Cycle encountered when mapping path: "someProperty.0.a.b.0"');
  });

  it('when mapping an array, provides values to mapping function', () => {
    const mapperMock = jest.fn(x => x);

    mapValuesDeep(mapperMock)([
      {
        a: { b: [{ c: 'some-value' }] },
      },
    ]);

    expect(mapperMock.mock.calls.map(nth(0))).toEqual([
      [
        {
          a: { b: [{ c: 'some-value' }] },
        },
      ],
      {
        a: { b: [{ c: 'some-value' }] },
      },
      { b: [{ c: 'some-value' }] },
      [{ c: 'some-value' }],
      { c: 'some-value' },
      'some-value',
    ]);
  });

  it('maps primitive values', () => {
    const actual = mapValuesDeep(x => x)({
      a: 42,
      b: 'some-string',
      c: false,
      d: true,
      e: null,
      f: NaN,
      g: Infinity,
      h: /some-regex/,
    });

    expect(actual).toEqual({
      a: 42,
      b: 'some-string',
      c: false,
      d: true,
      e: null,
      f: NaN,
      g: Infinity,
      h: /some-regex/,
    });
  });

  it('rejects undefined values', () => {
    const actual = mapValuesDeep(x => x)({
      a: undefined,
      b: { c: undefined, d: 'some-value' },
      e: 'some-other-value',
      f: [undefined, { g: 'yet-another-value', h: undefined }],
    });

    expect(actual).toEqual({
      b: { d: 'some-value' },
      e: 'some-other-value',
      f: [{ g: 'yet-another-value' }],
    });
  });

  it('maps root object', () => {
    const mapperMock = jest.fn(x => x);

    mapValuesDeep(mapperMock, { someProperty: 'some-value' });

    expect(mapperMock.mock.calls).toEqual([
      [{ someProperty: 'some-value' }, [], { someProperty: 'some-value' }],
      ['some-value', ['someProperty'], { someProperty: 'some-value' }],
    ]);
  });

  it('maps values to values of promises', async () => {
    const someObject = {
      someProperty: 'promise',
      someOtherProperty: 'some-sync-value',
    };

    const mapperStub = thing =>
      thing === 'promise' ? Promise.resolve('some-async-value') : thing;

    const actual = await mapValuesDeep(mapperStub, someObject);

    expect(actual).toEqual({
      someProperty: 'some-async-value',
      someOtherProperty: 'some-sync-value',
    });
  });

  it('given async mapper, works', async () => {
    const someObject = {
      someProperty: 'promise',
      someOtherProperty: 'some-sync-value',
    };

    const mapperStub = thing =>
      thing === 'promise' ? { some: 'some-async-value' } : thing;

    const actualPromise = mapValuesDeep(mapperStub, someObject);

    const actual = await actualPromise;

    expect(actual).toEqual({
      someProperty: { some: 'some-async-value' },
      someOtherProperty: 'some-sync-value',
    });
  });
});
