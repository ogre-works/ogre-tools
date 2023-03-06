import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';

describe('cycle-detection', () => {
  describe('given no cycle and injected', () => {
    let di;
    let goodInjectable;
    let badInjectable;
    let someCyclicalInjectable1;

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

      someCyclicalInjectable1 = getInjectable({
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

    it('given only bad work is done, throws error about only the cycle', () => {
      expect(() => {
        di.inject(badInjectable);
      }).toThrow(
        'Cycle of injectables encountered: "some-cyclical-injectable-1" -> "some-cyclical-injectable-2" -> "some-cyclical-injectable-1"',
      );
    });

    it('given good work is done, but then bad work is done, throws error about only the cycle', () => {
      di.inject(goodInjectable);

      expect(() => {
        di.inject(badInjectable);
      }).toThrow(
        'Cycle of injectables encountered: "some-cyclical-injectable-1" -> "some-cyclical-injectable-2" -> "some-cyclical-injectable-1"',
      );
    });

    it('given bad work is done, but the cycle in bad work is deregistered, when doing bad work again, does not throw', () => {
      try {
        di.inject(badInjectable);
      } catch (e) {}

      di.deregister(someCyclicalInjectable1);
      someCyclicalInjectable1.instantiate = () => 'no-longer-cyclical-instance';
      di.register(someCyclicalInjectable1);

      expect(() => {
        di.inject(badInjectable);
      }).not.toThrow();
    });
  });
});
