import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';

describe('cycle-detection', () => {
  it('given di with cycle detection disabled, only bad work is done, throws error about maximum call stack size exceeded', () => {
    const di = createContainer('some-container', { detectCycles: false });

    di.register(
      goodInjectable,
      badInjectable,
      workerInjectable,
      someInfinitelyCyclicalInjectable1,
      someInfinitelyCyclicalInjectable2,
    );

    expect(() => {
      di.inject(badInjectable);
    }).toThrow('Maximum call stack size exceeded');
  });

  describe('given di with cycle detection enabled', () => {
    let di;

    beforeEach(() => {
      di = createContainer('some-container');

      di.register(
        goodInjectable,
        badInjectable,
        workerInjectable,
        someInfinitelyCyclicalInjectable1,
        someInfinitelyCyclicalInjectable2,
        someFinitelyCyclicalInjectable1,
        someFinitelyCyclicalInjectable2,
        someInjectableWithoutDependencies,
      );
    });

    it('when injecting without cycle, does so', () => {
      const actual = di.inject(goodInjectable);

      expect(actual).toBe('some-good-result');
    });

    it('when injecting with cycle, throws error about the cycle', () => {
      expect(() => {
        di.inject(badInjectable);
      }).toThrow(
        'Cycle of injectables encountered: "some-cyclical-injectable-1" -> "some-cyclical-injectable-2" -> "some-cyclical-injectable-1"',
      );
    });

    it('given injecting first without cycle, when injecting same injectable again with cycle, throws error about only the new cycle', () => {
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

      di.deregister(someInfinitelyCyclicalInjectable1);
      someInfinitelyCyclicalInjectable1.instantiate = () =>
        'no-longer-cyclical-instance';
      di.register(someInfinitelyCyclicalInjectable1);

      expect(() => {
        di.inject(badInjectable);
      }).not.toThrow();
    });

    it('given injecting injectables which cannot cause cycles yet cause a finite cycle, when injected, does so', () => {
      const actual = di.inject(someFinitelyCyclicalInjectable1, 4);
      expect(actual).toBe(
        'instance-from-injectable-1(4) --> instance-from-injectable-2(3) --> instance-from-injectable-1(2) --> instance-from-injectable-2(1) --> end',
      );
    });

    it('given injecting injectable which has no dependencies, when injected, does so', () => {
      const actual = di.inject(someInjectableWithoutDependencies);

      expect(actual).toBe('some-instance');
    });
  });
});

const goodInjectable = getInjectable({
  id: 'some-good-injectable',
  instantiate: di => di.inject(workerInjectable)(true),
});

const badInjectable = getInjectable({
  id: 'some-bad-injectable',
  instantiate: di => di.inject(workerInjectable)(false),
});

const someInfinitelyCyclicalInjectable1 = getInjectable({
  id: 'some-cyclical-injectable-1',
  instantiate: di => di.inject(someInfinitelyCyclicalInjectable2),
});

const someInfinitelyCyclicalInjectable2 = getInjectable({
  id: 'some-cyclical-injectable-2',
  instantiate: di => di.inject(someInfinitelyCyclicalInjectable1),
});

const someFinitelyCyclicalInjectable1 = getInjectable({
  id: 'some-finitely-cyclical-injectable-1',
  instantiate: (di, counter) =>
    counter
      ? `instance-from-injectable-1(${counter}) --> ${di.inject(
          someFinitelyCyclicalInjectable2,
          counter - 1,
        )}`
      : 'end',
  cannotCauseCycles: true,
});

const someFinitelyCyclicalInjectable2 = getInjectable({
  id: 'some-finitely-cyclical-injectable-2',
  instantiate: (di, counter) =>
    counter
      ? `instance-from-injectable-2(${counter}) --> ${di.inject(
          someFinitelyCyclicalInjectable1,
          counter - 1,
        )}`
      : 'end',
  cannotCauseCycles: true,
});

const someInjectableWithoutDependencies = getInjectable({
  id: 'some-injectable-without-dependencies',
  instantiate: di => 'some-instance',
});

const workerInjectable = getInjectable({
  id: 'some-worker-injectable',
  instantiate: di => good =>
    good ? 'some-good-result' : di.inject(someInfinitelyCyclicalInjectable1),
});
