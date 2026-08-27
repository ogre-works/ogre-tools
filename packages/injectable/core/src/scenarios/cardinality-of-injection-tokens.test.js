import createContainer from '../dependency-injection-container/createContainer';
import getInjectable from '../getInjectable/getInjectable';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken } from '../getInjectionToken/getInjectionToken';
import {
  getInjectionToken2,
  getSpecificInjectionToken2,
} from '../getInjectionToken2/getInjectionToken2';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('cardinality-of-injection-tokens', () => {
  let di;

  beforeEach(() => {
    di = createContainer('some-container');
  });

  describe('given an injection token with cardinality "one"', () => {
    let someToken;

    beforeEach(() => {
      someToken = getInjectionToken2({
        id: 'some-token',
        cardinality: 'one',
      })();
    });

    it('when a .for() child is created, it inherits the cardinality', () => {
      expect(someToken.for('some-specifier').cardinality).toBe('one');
    });

    it('when a .for() grandchild is created, it still carries the cardinality', () => {
      expect(someToken.for('a').for('b').cardinality).toBe('one');
    });

    describe('given a registered implementation', () => {
      let someInjectable;

      beforeEach(() => {
        someInjectable = getInjectable2({
          id: 'some-injectable',
          injectionToken: someToken,
          instantiate: () => () => 'some-instance',
        });

        di.register(someInjectable);
      });

      it('when a second implementation is registered for the same token, throws', () => {
        const someOtherInjectable = getInjectable2({
          id: 'some-other-injectable',
          injectionToken: someToken,
          instantiate: () => () => 'irrelevant',
        });

        expect(() => {
          di.register(someOtherInjectable);
        }).toThrow(
          'Tried to register injectable "some-other-injectable" with injection token "some-token", but its cardinality "one" allows at most one registration and "some-injectable" is already registered.',
        );
      });

      it('when implementations register under .for() children, does not throw and injectMany of the base returns all', () => {
        const childImplementationA = getInjectable2({
          id: 'child-implementation-a',
          injectionToken: someToken.for('a'),
          instantiate: () => () => 'instance-a',
        });

        const childImplementationB = getInjectable2({
          id: 'child-implementation-b',
          injectionToken: someToken.for('b'),
          instantiate: () => () => 'instance-b',
        });

        di.register(childImplementationA, childImplementationB);

        expect(di.injectMany(someToken)).toEqual([
          'some-instance',
          'instance-a',
          'instance-b',
        ]);
      });

      it('when a second implementation registers under an already-implemented .for() child, throws with the child id', () => {
        const childImplementation = getInjectable2({
          id: 'child-implementation',
          injectionToken: someToken.for('a'),
          instantiate: () => () => 'irrelevant',
        });

        const competingChildImplementation = getInjectable2({
          id: 'competing-child-implementation',
          injectionToken: someToken.for('a'),
          instantiate: () => () => 'irrelevant',
        });

        di.register(childImplementation);

        expect(() => {
          di.register(competingChildImplementation);
        }).toThrow(
          'Tried to register injectable "competing-child-implementation" with injection token "some-token/a", but its cardinality "one" allows at most one registration and "child-implementation" is already registered.',
        );
      });

      it('when the implementation is deregistered, registering another succeeds', () => {
        di.deregister(someInjectable);

        const someOtherInjectable = getInjectable2({
          id: 'some-other-injectable',
          injectionToken: someToken,
          instantiate: () => () => 'some-other-instance',
        });

        di.register(someOtherInjectable);

        expect(di.inject(someToken)).toBe('some-other-instance');
      });

      it('when the implementation is overridden, does not throw and inject returns the override', () => {
        di.override(someToken, () => () => 'some-overridden-instance');

        expect(di.inject(someToken)()).toBe('some-overridden-instance');
      });
    });
  });

  describe('given an injection token with cardinality "zero-or-one"', () => {
    let someToken;

    beforeEach(() => {
      someToken = getInjectionToken2({
        id: 'some-token',
        cardinality: 'zero-or-one',
      })();
    });

    it('when a second implementation is registered, throws', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someToken,
          instantiate: () => () => 'irrelevant',
        }),
      );

      expect(() => {
        di.register(
          getInjectable2({
            id: 'some-other-injectable',
            injectionToken: someToken,
            instantiate: () => () => 'irrelevant',
          }),
        );
      }).toThrow(
        'Tried to register injectable "some-other-injectable" with injection token "some-token", but its cardinality "zero-or-one" allows at most one registration and "some-injectable" is already registered.',
      );
    });
  });

  describe.each(['zero-or-many', 'one-or-many'])(
    'given an injection token with cardinality "%s"',
    cardinality => {
      it('when multiple implementations are registered, does not throw', () => {
        const someToken = getInjectionToken2({
          id: 'some-token',
          cardinality,
        })();

        di.register(
          getInjectable2({
            id: 'some-injectable',
            injectionToken: someToken,
            instantiate: () => () => 'some-instance',
          }),

          getInjectable2({
            id: 'some-other-injectable',
            injectionToken: someToken,
            instantiate: () => () => 'some-other-instance',
          }),
        );

        expect(di.injectMany(someToken)).toEqual([
          'some-instance',
          'some-other-instance',
        ]);
      });
    },
  );

  describe('given a specific injection token factory declaring a cardinality of its own', () => {
    let someToken;

    beforeEach(() => {
      someToken = getInjectionToken2({
        id: 'some-token',
        cardinality: 'zero-or-many',
      })(specifier =>
        getSpecificInjectionToken2()({
          id: specifier,
          speciality: specifier,
          cardinality: 'one',
        }),
      );
    });

    it('when a .for() child is created, it carries the cardinality the factory declared', () => {
      expect(someToken.for('some-specifier').cardinality).toBe('one');
    });

    it('when multiple implementations register for the base token, does not throw', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someToken,
          instantiate: () => () => 'irrelevant',
        }),

        getInjectable2({
          id: 'some-other-injectable',
          injectionToken: someToken,
          instantiate: () => () => 'irrelevant',
        }),
      );
    });

    it('when a second implementation registers under the same .for() child, throws with the child cardinality', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someToken.for('a'),
          instantiate: () => () => 'irrelevant',
        }),
      );

      expect(() => {
        di.register(
          getInjectable2({
            id: 'some-other-injectable',
            injectionToken: someToken.for('a'),
            instantiate: () => () => 'irrelevant',
          }),
        );
      }).toThrow(
        'Tried to register injectable "some-other-injectable" with injection token "some-token/a", but its cardinality "one" allows at most one registration and "some-injectable" is already registered.',
      );
    });
  });

  describe('given a v1 injection token, which has no cardinality', () => {
    it('when multiple implementations are registered, does not throw', () => {
      const someV1Token = getInjectionToken({ id: 'some-v1-token' });

      di.register(
        getInjectable({
          id: 'some-injectable',
          injectionToken: someV1Token,
          instantiate: () => 'some-instance',
          lifecycle: lifecycleEnum.transient,
        }),

        getInjectable({
          id: 'some-other-injectable',
          injectionToken: someV1Token,
          instantiate: () => 'some-other-instance',
          lifecycle: lifecycleEnum.transient,
        }),
      );

      expect(di.injectMany(someV1Token)).toEqual([
        'some-instance',
        'some-other-instance',
      ]);
    });
  });

  describe('creation-time validation', () => {
    it('when creating a token without cardinality, throws', () => {
      expect(() => {
        getInjectionToken2({ id: 'some-token' })();
      }).toThrow(
        'Tried to create injection token "some-token" without cardinality.',
      );
    });

    it('when creating a token with an unknown cardinality, throws', () => {
      expect(() => {
        getInjectionToken2({ id: 'some-token', cardinality: 'sometimes' })();
      }).toThrow(
        'Tried to create injection token "some-token" with unknown cardinality "sometimes".',
      );
    });

    it('when creating a specific token with an unknown cardinality, throws', () => {
      expect(() => {
        getSpecificInjectionToken2()({
          id: 'some-token',
          speciality: 'some-speciality',
          cardinality: 'sometimes',
        });
      }).toThrow(
        'Tried to create injection token "some-token" with unknown cardinality "sometimes".',
      );
    });

    it("when creating a specific token without a cardinality, does not throw — it inherits its family's", () => {
      expect(() => {
        getSpecificInjectionToken2()({
          id: 'some-token',
          speciality: 'some-speciality',
        });
      }).not.toThrow();
    });
  });
});
