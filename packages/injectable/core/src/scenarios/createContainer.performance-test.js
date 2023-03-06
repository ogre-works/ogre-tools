import createContainer, {
  registrationDecoratorToken,
} from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import { range } from 'lodash/fp';
import getInjectionToken from '../getInjectionToken/getInjectionToken';

const performance = require('perf_hooks').performance;

// Note: To be used for optimizing performance
describe('createContainer.performance', () => {
  let injectables;
  let di;

  beforeEach(() => {
    di = createContainer('some-container-id');

    injectables = range(0, 10000).flatMap(x => {
      const child = getInjectable({
        id: `some-child-id-${x}`,
        instantiate: () => {},
      });

      // Note: multiple parents to deliberately trigger cycle-detection.
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
      expect(p2 - p1).toBeLessThan(40);
    });

    it('when injecting, is quick enough', () => {
      const p1 = performance.now();

      di.injectMany(someInjectionToken);

      const p2 = performance.now();

      // TODO: Figure out way to make it even faster
      expect(p2 - p1).toBeLessThan(200);
    });
  });

  describe('given registration decorator, when registering', () => {
    let p1;
    let p2;

    beforeEach(() => {
      const someRegistrationDecorator = getInjectable({
        id: 'some-registration-decorator',

        instantiate:
          di =>
          toBeDecorated =>
          (...args) =>
            toBeDecorated(...args),

        injectionToken: registrationDecoratorToken,
      });

      di.register(someRegistrationDecorator);

      p1 = performance.now();

      di.register(...injectables);

      p2 = performance.now();
    });

    it('is quick enough', () => {
      // TODO: Figure out way to make it even faster
      expect(p2 - p1).toBeLessThan(40);
    });

    it('when injecting, is quick enough', () => {
      const p1 = performance.now();

      di.injectMany(someInjectionToken);
      const p2 = performance.now();

      // TODO: Figure out way to make it even faster
      expect(p2 - p1).toBeLessThan(200);
    });
  });
});

const someInjectionToken = getInjectionToken({ id: 'some-injection-token' });
