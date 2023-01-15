import tap from './tap';

describe('tap', () => {
  describe('given a tapping function and synchronous iterable, when iterated', () => {
    let iterations;
    let tappingFunctionMock;

    beforeEach(() => {
      tappingFunctionMock = jest.fn(() => 'return-value-has-no-effect');

      const synchronousIterable = [1, 2];

      const iterableForMappedValues = tap(
        tappingFunctionMock,
        synchronousIterable,
      );

      const iterator = iterableForMappedValues[Symbol.iterator]();

      iterations = [iterator.next(), iterator.next(), iterator.next()];
    });

    it('calls the tapping function for all iterated values', () => {
      expect(tappingFunctionMock.mock.calls).toEqual([[1], [2]]);
    });

    it('iterates non-altered values', () => {
      expect(iterations).toEqual([
        {
          value: 1,
          done: false,
        },
        {
          value: 2,
          done: false,
        },
        {
          value: undefined,
          done: true,
        },
      ]);
    });
  });

  describe('given a tapping function and asynchronous iterable, when iterated', () => {
    let iterations;
    let tappingFunctionMock;

    beforeEach(async () => {
      tappingFunctionMock = jest.fn(() => 'return-value-has-no-effect');

      const asynchronousIterable = (async function*() {
        yield 1;
        yield await 2;
        yield Promise.resolve(3);
      })();

      const iterableForMappedValues = tap(tappingFunctionMock)(
        asynchronousIterable,
      );

      const iterator = iterableForMappedValues[Symbol.asyncIterator]();

      iterations = [
        await iterator.next(),
        await iterator.next(),
        await iterator.next(),
        await iterator.next(),
      ];
    });

    it('calls the tapping function for all iterated values', () => {
      expect(tappingFunctionMock.mock.calls).toEqual([[1], [2], [3]]);
    });

    it('iterates non-altered values', async () => {
      expect(iterations).toEqual([
        {
          value: 1,
          done: false,
        },
        {
          value: 2,
          done: false,
        },
        {
          value: 3,
          done: false,
        },
        {
          value: undefined,
          done: true,
        },
      ]);
    });
  });
});
