import createContainer from '../dependency-injection-container/createContainer';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { range } from 'lodash/fp';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { instantiationDecoratorToken } from '../dependency-injection-container/tokens';

const performance = require('perf_hooks').performance;

const someInjectionToken2 = getInjectionToken2({
  id: 'some-injection-token-2',
});

// Mirror of override-pattern.performance-test.js using the injectable2/token2
// API for the base injectables (the override itself is already injectable2
// via instantiationDecoratorToken in the v1 mirror).
const buildBaseInjectables = () =>
  range(0, 10000).flatMap(x => {
    const child = getInjectable2({
      id: `some-child-id-${x}`,
      instantiate: () => () => null,
    });

    const parent = getInjectable2({
      id: `some-parent-id-${x}`,
      injectionToken: someInjectionToken2,
      instantiate: di => {
        di.inject(child)();
        return () => null;
      },
    });

    const parent2 = getInjectable2({
      id: `some-parent-2-id-${x}`,
      injectionToken: someInjectionToken2,
      instantiate: di => {
        di.inject(child)();
        return () => null;
      },
    });

    return [parent, parent2, child];
  });

describe('override-pattern2.performance', () => {
  describe('30k injectables + 1 override-injectable', () => {
    let p1;
    let p2;
    let di;

    beforeEach(() => {
      di = createContainer('some-container-id');
      const baseInjectables = buildBaseInjectables();
      const overrideInjectable = getInjectable2({
        id: 'override--some-child-id-0',
        injectionToken: instantiationDecoratorToken.for(baseInjectables[2]),
        instantiate: () => () => () => () => 'overridden',
      });

      p1 = performance.now();
      di.register(...baseInjectables, overrideInjectable);
      p2 = performance.now();
    });

    it('register: logs and asserts threshold', () => {
      console.log(
        `[BENCH] override2 1-of-30k register: ${(p2 - p1).toFixed(2)}ms`,
      );
      // TODO: align with v1 threshold once v2 register overhead is reduced.
      expect(p2 - p1).toBeLessThan(60);
    });
  });

  describe('30k injectables + 1k override-injectables', () => {
    let p1;
    let p2;
    let di;

    beforeEach(() => {
      di = createContainer('some-container-id');
      const baseInjectables = buildBaseInjectables();
      const overrides = range(0, 1000).map(x =>
        getInjectable2({
          id: `override--some-child-id-${x}`,
          injectionToken: instantiationDecoratorToken.for(
            baseInjectables[x * 3 + 2],
          ),
          instantiate: () => () => () => () => 'overridden',
        }),
      );

      p1 = performance.now();
      di.register(...baseInjectables, ...overrides);
      p2 = performance.now();
    });

    it('register: logs (no hard budget)', () => {
      console.log(
        `[BENCH] override2 1k-of-30k register: ${(p2 - p1).toFixed(2)}ms`,
      );
      expect(p2 - p1).toBeLessThan(200);
    });
  });

  describe('30k injectables, none overridden', () => {
    let di;
    let injectables;

    beforeEach(() => {
      di = createContainer('some-container-id');
      injectables = buildBaseInjectables();
      di.register(...injectables);
    });

    it('inject: lazy decorator lookup remains fast', () => {
      const p1 = performance.now();

      di.injectMany(someInjectionToken2);

      const p2 = performance.now();

      console.log(
        `[BENCH] no-overrides2 30k inject: ${(p2 - p1).toFixed(2)}ms`,
      );
      // TODO: v2 inject pays for an extra factory call per inject + 4 extra
      // minimalDi closures. Tighten when those are reduced.
      expect(p2 - p1).toBeLessThan(350);
    });
  });
});
