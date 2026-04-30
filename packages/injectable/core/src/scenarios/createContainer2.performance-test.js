import createContainer from '../dependency-injection-container/createContainer';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { range } from 'lodash/fp';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

const performance = require('perf_hooks').performance;

const someInjectionToken2 = getInjectionToken2({
  id: 'some-injection-token-2',
});

// Mirror of createContainer.performance-test.js using the injectable2/token2
// API. Each parent eagerly injects its child during its outer instantiate
// call (di.inject(child)() invokes the factory) so the inject pipeline is
// exercised the same way as the v1 test.
describe('createContainer2.performance', () => {
  let injectables;
  let di;

  beforeEach(() => {
    di = createContainer('some-container-id');

    injectables = range(0, 10000).flatMap(x => {
      const child = getInjectable2({
        id: `some-child-id-${x}`,
        instantiate: () => () => null,
      });

      // Note: multiple parents to deliberately trigger cycle-detection.
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
  });

  describe('when registering', () => {
    let p1;
    let p2;

    beforeEach(() => {
      p1 = performance.now();

      di.register(...injectables);

      p2 = performance.now();
    });

    it('is quick enough', () => {
      console.log(
        `[BENCH] createContainer2 30k register: ${(p2 - p1).toFixed(2)}ms`,
      );
      // TODO: align with v1 createContainer.performance-test threshold once
      // v2 minimalDi overhead is reduced.
      expect(p2 - p1).toBeLessThan(60);
    });

    it('when injecting, is quick enough', () => {
      const p1 = performance.now();

      di.injectMany(someInjectionToken2);

      const p2 = performance.now();

      console.log(
        `[BENCH] createContainer2 30k inject: ${(p2 - p1).toFixed(2)}ms`,
      );
      // TODO: v2 inject pays for an extra factory call per inject + 4 extra
      // minimalDi closures. Tighten when those are reduced.
      expect(p2 - p1).toBeLessThan(350);
    });
  });
});
