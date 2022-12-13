import createContainer from './createContainer';
import getInjectable from '../getInjectable/getInjectable';

xdescribe('cycle-detection', () => {
  describe('given no cycle and injected', () => {
    let di;
    let goodInjectable;
    let badInjectable;

    beforeEach(() => {
      di = createContainer('some-container');

      goodInjectable = getInjectable({
        id: 'some-good-injectable',
        instantiate: di => di.inject(workerInjectable)(true),
      });

      badInjectable = getInjectable({
        id: 'some-bad-injectable',
        instantiate: di => di.inject(workerInjectable)(false),
      });

      const someCyclicalInjectable1 = getInjectable({
        id: 'some-cyclical-injectable-1',
        instantiate: di => di.inject(someCyclicalInjectable2),
      });

      const someCyclicalInjectable2 = getInjectable({
        id: 'some-cyclical-injectable-2',
        instantiate: di => di.inject(someCyclicalInjectable1),
      });

      const workerInjectable = getInjectable({
        id: 'some-worker-injectable',
        instantiate: di => good =>
          good ? 'some-good-result' : di.inject(someCyclicalInjectable1),
      });

      di.register(
        goodInjectable,
        badInjectable,
        workerInjectable,
        someCyclicalInjectable1,
        someCyclicalInjectable2,
      );
    });

    it('given good work is done, injects', () => {
      const actual = di.inject(goodInjectable);

      expect(actual).toBe('some-good-result');
    });

    it('given only bad work is done, throws context of bad work', () => {
      expect(() => {
        di.inject(badInjectable);
      }).toThrow(
        'Cycle of injectables encountered: "some-container" -> "some-bad-injectable" -> "some-worker-injectable" -> "some-cyclical-injectable-1" -> "some-cyclical-injectable-2" -> "some-cyclical-injectable-1"',
      );
    });

    fit('given good work is done, but then bad work is done, throws context of bad work', () => {
      di.inject(goodInjectable);

      expect(() => {
        di.inject(badInjectable);
      }).toThrow(
        'Cycle of injectables encountered: "some-container" -> "some-bad-injectable" -> "some-worker-injectable" -> "some-cyclical-injectable-1" -> "some-cyclical-injectable-2" -> "some-cyclical-injectable-1"',
      );
    });
  });
});
