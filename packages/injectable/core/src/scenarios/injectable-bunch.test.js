import createContainer from '../dependency-injection-container/createContainer';
import getInjectableBunch from '../getInjectableBunch/getInjectableBunch';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import getInjectable from '../getInjectable/getInjectable';
import isInjectableBunch from '../getInjectableBunch/isInjectableBunch';

describe('injectable-bunch', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  it('given undefined, when checking if bunch, return false', () => {
    const actual = isInjectableBunch(undefined);

    expect(actual).toBe(false);
  });

  describe('given a bunch containing multiple injectables and registered', () => {
    let bunch;

    beforeEach(() => {
      bunch = getInjectableBunch({
        someInjectable: getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-instance',
        }),

        someOtherInjectable: getInjectable({
          id: 'irrelevant',
          instantiate: () => 'irrelevant',
        }),
      });

      di.register(bunch);
    });

    it('when injecting one of the injectables, does so', () => {
      const actual = di.inject(bunch.someInjectable);

      expect(actual).toBe('some-instance');
    });

    it('given the bunch is deregistered, when still injecting one of the injectables, throws', () => {
      di.deregister(bunch);

      expect(() => {
        di.inject(bunch.someInjectable);
      }).toThrow(
        'Tried to inject non-registered injectable "some-container" -> "some-injectable".',
      );
    });
  });

  describe('given a bunch containing injectables injecting each other, and registered', () => {
    let bunch;

    beforeEach(() => {
      const someOtherInjectable = getInjectable({
        id: 'irrelevant',
        instantiate: () => 'some-instance-2',
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',

        instantiate: di => {
          const someOtherInstance = di.inject(someOtherInjectable);

          return `some-instance-1(${someOtherInstance})`;
        },
      });

      bunch = getInjectableBunch({
        someInjectable,
        someOtherInjectable,
      });

      di.register(bunch);
    });

    it('when injecting, instances of all related injectables get injected', () => {
      const actual = di.inject(bunch.someInjectable);

      expect(actual).toBe('some-instance-1(some-instance-2)');
    });
  });

  describe('given a bunch containing injectable-imitators and registered', () => {
    let bunch;

    beforeEach(() => {
      bunch = getInjectableBunch({
        // Notice: lack of getInjectable makes this just an injectable-like
        someInjectableLike: {
          id: 'some-injectable-imitator',
          instantiate: () => 'some-instance',
        },

        someObject: {
          someProperty: 'irrelevant',
        },

        someString: 'irrelevant',
      });

      di.register(bunch);
    });

    it('when injecting one of the injectable-imitators, throws', () => {
      expect(() => {
        di.inject(bunch.someInjectableLike);
      }).toThrow(
        'Tried to inject non-registered injectable "some-container" -> "some-injectable-imitator".',
      );
    });
  });

  describe('given a bunch containing a nested bunch, when registered', () => {
    let rootBunch;

    beforeEach(() => {
      rootBunch = getInjectableBunch({
        nestedBunch: getInjectableBunch({
          someInjectable: getInjectable({
            id: 'some-injectable',
            instantiate: () => 'some-instance',
          }),
        }),
      });

      di.register(rootBunch);
    });

    it('when injecting an injectable from the nested bunch, does so', () => {
      const actual = di.inject(rootBunch.nestedBunch.someInjectable);

      expect(actual).toBe('some-instance');
    });

    it('given root bunch is deregistered, when injecting an injectable from the nested bunch, throws', () => {
      di.deregister(rootBunch);

      expect(() => {
        di.inject(rootBunch.nestedBunch.someInjectable);
      }).toThrow(
        'Tried to inject non-registered injectable "some-container" -> "some-injectable".',
      );
    });

    it('given nested bunch is deregistered, when injecting an injectable from the nested bunch, throws', () => {
      di.deregister(rootBunch.nestedBunch);

      expect(() => {
        di.inject(rootBunch.nestedBunch.someInjectable);
      }).toThrow(
        'Tried to inject non-registered injectable "some-container" -> "some-injectable".',
      );
    });

    it('given nested bunch is deregistered, when weirdly also root bunch is deregistered, throws', () => {
      di.deregister(rootBunch.nestedBunch);

      expect(() => {
        di.deregister(rootBunch);
      }).toThrow(
        'Tried to deregister non-registered injectable "some-injectable".',
      );
    });

    it('when weirdly both root and nested bunch are deregistered, throws', () => {
      expect(() => {
        di.deregister(rootBunch, rootBunch.nestedBunch);
      }).toThrow(
        'Tried to deregister non-registered injectable "some-injectable".',
      );
    });
  });

  describe('given a bunch containing multiple injectables and registered late', () => {
    let someInjectableBunch;
    let someInjectionToken;

    beforeEach(() => {
      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectableBunch = getInjectableBunch({
        someInjectable: getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-instance',
          injectionToken: someInjectionToken,
        }),

        someOtherInjectable: getInjectable({
          id: 'irrelevant',
          instantiate: () => 'irrelevant',
        }),
      });

      const someLateRegistererInjectable = getInjectable({
        id: 'some-late-registerer',

        instantiate: di => ({
          lateRegister: di.register,
        }),
      });

      di.register(someLateRegistererInjectable);

      const { lateRegister } = di.inject(someLateRegistererInjectable);

      lateRegister(someInjectableBunch);
    });

    it('when injecting one of the injectables, does so', () => {
      const actual = di.inject(someInjectableBunch.someInjectable);

      expect(actual).toBe('some-instance');
    });
  });
});
