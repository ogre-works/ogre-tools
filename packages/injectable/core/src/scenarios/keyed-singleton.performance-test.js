import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';
import { range } from 'lodash/fp';

const performance = require('perf_hooks').performance;

// Stresses the keyed-singleton path which (unlike plain singletons) still
// allocates a CompositeMap per injectable and stores one cache entry per
// distinct key. 100 injectables × 1000 keys = 100k cached entries.
describe('keyed-singleton.performance', () => {
  const numInjectables = 100;
  const numKeysPerInjectable = 1000;

  let di;
  let injectables;
  let keys;

  beforeEach(() => {
    di = createContainer('some-container-id');

    injectables = range(0, numInjectables).map(i =>
      getInjectable({
        id: `some-keyed-injectable-${i}`,
        instantiate: (_, key) => ({ injectableIndex: i, key }),
        lifecycle: lifecycleEnum.keyedSingleton({
          getInstanceKey: (_, key) => key,
        }),
      }),
    );

    di.register(...injectables);

    keys = range(0, numKeysPerInjectable).map(k => `some-key-${k}`);
  });

  describe('first-pass inject (cache misses) for 100k keys', () => {
    let elapsed;

    beforeEach(() => {
      const p1 = performance.now();

      for (let i = 0; i < numInjectables; i++) {
        const injectable = injectables[i];
        for (let k = 0; k < numKeysPerInjectable; k++) {
          di.inject(injectable, keys[k]);
        }
      }

      const p2 = performance.now();
      elapsed = p2 - p1;
    });

    it('logs and asserts threshold', () => {
      console.log(
        `[BENCH] keyed-singleton 100k first-pass inject: ${elapsed.toFixed(
          2,
        )}ms`,
      );
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe('second-pass inject (cache hits) for 100k keys', () => {
    let elapsed;

    beforeEach(() => {
      // Warm the cache
      for (let i = 0; i < numInjectables; i++) {
        const injectable = injectables[i];
        for (let k = 0; k < numKeysPerInjectable; k++) {
          di.inject(injectable, keys[k]);
        }
      }

      const p1 = performance.now();

      for (let i = 0; i < numInjectables; i++) {
        const injectable = injectables[i];
        for (let k = 0; k < numKeysPerInjectable; k++) {
          di.inject(injectable, keys[k]);
        }
      }

      const p2 = performance.now();
      elapsed = p2 - p1;
    });

    it('logs and asserts threshold', () => {
      console.log(
        `[BENCH] keyed-singleton 100k second-pass inject: ${elapsed.toFixed(
          2,
        )}ms`,
      );
      expect(elapsed).toBeLessThan(300);
    });
  });
});
