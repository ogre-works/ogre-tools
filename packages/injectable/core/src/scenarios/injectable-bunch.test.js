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
        someInjectable: {
          id: 'some-injectable',
          instantiate: () => 'some-instance',
        },

        someOtherInjectable: {
          id: 'irrelevant',
          instantiate: () => 'irrelevant',
        },
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

  describe('given a bunch containing multiple injectables and registered late', () => {
    let someInjectableBunch;
    let someInjectionToken;

    beforeEach(() => {
      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      someInjectableBunch = getInjectableBunch({
        someInjectable: {
          id: 'some-injectable',
          instantiate: () => 'some-instance',
          injectionToken: someInjectionToken,
        },

        someOtherInjectable: {
          id: 'irrelevant',
          instantiate: () => 'irrelevant',
        },
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
