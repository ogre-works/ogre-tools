import createContainer from './createContainer';
import getInjectable from '../getInjectable/getInjectable';
import { range } from 'lodash/fp';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

const performance = require('perf_hooks').performance;

describe('createContainer.performance', () => {
  let injectables;
  let di;

  beforeEach(() => {
    di = createContainer('some-container-id');

    injectables = range(0, 10000).map(x =>
      getInjectable({
        id: 'some-id-' + x,
        injectionToken: someInjectionToken,
        instantiate: () => {},
      }),
    );
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
      // TODO: Figure out way to make it even faster
      expect(p2 - p1).toBeLessThan(20);
    });

    it('when injecting, is quick enough', () => {
      const p1 = performance.now();

      di.injectMany(someInjectionToken);

      const p2 = performance.now();

      // TODO: Figure out way to make it even faster
      expect(p2 - p1).toBeLessThan(60);
    });
  });
});

const someInjectionToken = getInjectionToken({ id: 'some-injection-token' });
