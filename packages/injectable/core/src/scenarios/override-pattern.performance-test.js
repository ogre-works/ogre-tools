import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { range } from 'lodash/fp';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import { instantiationDecoratorToken } from '../dependency-injection-container/tokens';

const performance = require('perf_hooks').performance;

const someInjectionToken = getInjectionToken({ id: 'some-injection-token' });

const buildBaseInjectables = () =>
  range(0, 10000).flatMap(x => {
    const child = getInjectable({
      id: `some-child-id-${x}`,
      instantiate: () => {},
    });

    const parent = getInjectable({
      id: `some-parent-id-${x}`,
      injectionToken: someInjectionToken,
      instantiate: di => di.inject(child),
    });

    const parent2 = getInjectable({
      id: `some-parent-2-id-${x}`,
      injectionToken: someInjectionToken,
      instantiate: di => di.inject(child),
    });

    return [parent, parent2, child];
  });

describe('override-pattern.performance', () => {
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
        `[BENCH] override 1-of-30k register: ${(p2 - p1).toFixed(2)}ms`,
      );
      // TODO: align with createContainer.performance-test threshold once hardware-feasible
      expect(p2 - p1).toBeLessThan(40);
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
        `[BENCH] override 1k-of-30k register: ${(p2 - p1).toFixed(2)}ms`,
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

      di.injectMany(someInjectionToken);

      const p2 = performance.now();

      console.log(`[BENCH] no-overrides 30k inject: ${(p2 - p1).toFixed(2)}ms`);
      expect(p2 - p1).toBeLessThan(200);
    });
  });
});
