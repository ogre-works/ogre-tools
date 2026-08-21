import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { instancePurgeCallbackToken } from '../dependency-injection-container/tokens';
import { range } from 'lodash/fp';

const performance = require('perf_hooks').performance;

const count = 10000;

const getKeyedInjectable = id =>
  getInjectable({
    id,

    lifecycle: lifecycleEnum.keyedSingleton({
      getInstanceKey: (di, key) => key,
    }),

    instantiate: (di, key) => `${id}-${key}`,
  });

// Purging without any purge callback registered must not visit instances one
// by one — it only has to drop them. The two single-injectable thresholds below
// are deliberately tight: they are what catches a reintroduced per-instance
// pass, which measured at ~4.5ms and ~2.2ms respectively. The whole-container
// and with-callback cases iterate every injectable either way, so their
// thresholds only document the cost.
describe('purge.performance', () => {
  describe('given no purge callbacks are registered', () => {
    it('when purging many keyed instances of one injectable, is quick enough', () => {
      const di = createContainer('some-container-id');
      const someInjectable = getKeyedInjectable('some-injectable');

      di.register(someInjectable);
      range(0, count).forEach(x => di.inject(someInjectable, `some-key-${x}`));

      const p1 = performance.now();

      di.purge(someInjectable);

      const p2 = performance.now();

      console.log(`[BENCH] purge of ${count} keyed instances: ${(p2 - p1).toFixed(2)}ms`);

      expect(p2 - p1).toBeLessThan(2.5);
    });

    it('when purging every instance in the container, is quick enough', () => {
      const di = createContainer('some-container-id');

      const injectables = range(0, count).map(x =>
        getKeyedInjectable(`some-injectable-${x}`),
      );

      di.register(...injectables);
      injectables.forEach(x => di.inject(x, 'some-key'));

      const p1 = performance.now();

      di.purge();

      const p2 = performance.now();

      console.log(`[BENCH] purge of ${count} injectables: ${(p2 - p1).toFixed(2)}ms`);

      expect(p2 - p1).toBeLessThan(30);
    });

    it('when a scope purges what it registered, is quick enough', () => {
      const someChild = getKeyedInjectable('some-child');
      let scopedDi;

      const someScope = getInjectable({
        id: 'some-scope',

        instantiate: di => {
          di.register(someChild);
          range(0, count).forEach(x => di.inject(someChild, `some-key-${x}`));
          scopedDi = di;

          return 'some-scope-instance';
        },
      });

      const di = createContainer('some-container-id');
      di.register(someScope);
      di.inject(someScope);

      const p1 = performance.now();

      scopedDi.purge(someChild);

      const p2 = performance.now();

      console.log(`[BENCH] scoped purge of ${count} keyed instances: ${(p2 - p1).toFixed(2)}ms`);

      expect(p2 - p1).toBeLessThan(1.5);
    });
  });

  describe('given a purge callback is registered', () => {
    it('when purging many keyed instances, pays for visiting each of them', () => {
      const di = createContainer('some-container-id');
      const someInjectable = getKeyedInjectable('some-injectable');

      di.register(
        someInjectable,

        getInjectable({
          id: 'some-purge-callback',
          injectionToken: instancePurgeCallbackToken.for(someInjectable),
          instantiate: () => () => () => {},
        }),
      );

      range(0, count).forEach(x => di.inject(someInjectable, `some-key-${x}`));

      const p1 = performance.now();

      di.purge(someInjectable);

      const p2 = performance.now();

      console.log(
        `[BENCH] purge of ${count} keyed instances with a callback: ${(p2 - p1).toFixed(2)}ms`,
      );

      expect(p2 - p1).toBeLessThan(60);
    });
  });
});
