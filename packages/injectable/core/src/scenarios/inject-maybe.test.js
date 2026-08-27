import createContainer from '../dependency-injection-container/createContainer';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';
import { preInjectCallbackToken } from '../dependency-injection-container/tokens';
import { idBasedSpecificToken2 } from '../test-utils/idBasedSpecificToken2';

describe('createContainer.injectMaybe', () => {
  let di;
  let someMaybeToken;

  beforeEach(() => {
    di = createContainer('some-container');

    someMaybeToken = getInjectionToken2({
      id: 'some-maybe-token',
      cardinality: 'zero-or-one',
    })(idBasedSpecificToken2);
  });

  describe('given a token with cardinality "zero-or-one"', () => {
    it('when no implementation is registered, injecting maybe returns undefined', () => {
      expect(di.injectMaybe2(someMaybeToken)()).toBe(undefined);
    });

    it('when an implementation is registered, injecting maybe returns the instance', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken.for('some-specifier'),
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(di.injectMaybe2(someMaybeToken)()).toBe('some-instance');
    });

    it('when the factory is obtained before the implementation is registered, invoking it afterwards returns the instance', () => {
      const getMaybeInstance = di.injectMaybe2(someMaybeToken);

      expect(getMaybeInstance()).toBe(undefined);

      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken.for('some-specifier'),
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(getMaybeInstance()).toBe('some-instance');
    });

    it('when the implementation is deregistered, invoking the factory again returns undefined', () => {
      const someInjectable = getInjectable2({
        id: 'some-injectable',
        injectionToken: someMaybeToken.for('some-specifier'),
        instantiate: () => () => 'some-instance',
      });

      di.register(someInjectable);

      const getMaybeInstance = di.injectMaybe2(someMaybeToken);

      expect(getMaybeInstance()).toBe('some-instance');

      di.deregister(someInjectable);

      expect(getMaybeInstance()).toBe(undefined);
    });

    it('given a parametric implementation, when invoking the factory with parameters, they reach the instance', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken.for('some-specifier'),
          instantiate: () => (someParameter, someOtherParameter) =>
            `some-instance: ${someParameter}, ${someOtherParameter}`,
        }),
      );

      expect(di.injectMaybe2(someMaybeToken)('a', 'b')).toBe(
        'some-instance: a, b',
      );
    });

    it('given the implementation is registered for a .for() child, injecting maybe the child returns the instance', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken.for('some-specifier'),
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(di.injectMaybe2(someMaybeToken.for('some-specifier'))()).toBe(
        'some-instance',
      );
    });

    it('when injecting maybe from within an injectable, works the same', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken.for('some-specifier'),
          instantiate: () => () => 'some-instance',
        }),
      );

      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someMaybeToken],

        instantiate: di => {
          const getMaybeInstance = di.injectMaybe(someMaybeToken);

          return () => `consumed: ${getMaybeInstance()}`;
        },
      });

      di.register(someConsumer);

      expect(di.inject(someConsumer)).toBe('consumed: some-instance');
    });
  });

  describe.each(['one', 'zero-or-many', 'one-or-many'])(
    'given a token with cardinality "%s"',
    cardinality => {
      it('when injecting maybe, throws', () => {
        const someToken = getInjectionToken2({
          id: 'some-token',
          cardinality,
        })();

        expect(() => {
          di.injectMaybe2(someToken);
        }).toThrow(
          `Tried to injectMaybe "some-token" from "some-container", but its cardinality is "${cardinality}" instead of "zero-or-one".`,
        );
      });
    },
  );

  it('given an injectable, when injecting maybe, throws', () => {
    const someInjectable = getInjectable2({
      id: 'some-injectable',
      instantiate: () => () => 'irrelevant',
    });

    expect(() => {
      di.injectMaybe2(someInjectable);
    }).toThrow(
      'Tried to injectMaybe "some-injectable" from "some-container", but its cardinality is "undefined" instead of "zero-or-one".',
    );
  });

  it('given an injectable injecting maybe a token of the wrong cardinality, when injected, throws naming the injectable', () => {
    const someOtherToken = getInjectionToken2({
      id: 'some-other-token',
      cardinality: 'zero-or-many',
    })();

    const someConsumer = getInjectable2({
      id: 'some-consumer',
      consumptions: [someOtherToken],

      instantiate: di => {
        di.injectMaybe(someOtherToken);

        return () => 'irrelevant';
      },
    });

    di.register(someConsumer);

    expect(() => {
      di.inject(someConsumer);
    }).toThrow(
      'Tried to injectMaybe "some-other-token" from "some-consumer", but its cardinality is "zero-or-many" instead of "zero-or-one".',
    );
  });

  describe('given a pre-inject callback targeting the token', () => {
    let preInjectCallbackMock;

    beforeEach(() => {
      preInjectCallbackMock = jest.fn();

      di.register(
        getInjectable2({
          id: 'some-pre-inject-callback',
          injectionToken: preInjectCallbackToken.for(someMaybeToken),
          instantiate: () => () => preInjectCallbackMock,
        }),

        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken.for('some-specifier'),
          instantiate: () => () => 'some-instance',
        }),
      );
    });

    it('when the factory is invoked, the callback fires once, as an injectMany operation', () => {
      di.injectMaybe2(someMaybeToken)();

      expect(preInjectCallbackMock.mock.calls).toEqual([
        [
          someMaybeToken,
          'injectMany',
          { id: 'some-container', aliasType: 'container' },
        ],
      ]);
    });

    it('when the factory is invoked twice, the callback fires per invocation', () => {
      const getMaybeInstance = di.injectMaybe2(someMaybeToken);

      getMaybeInstance();
      getMaybeInstance();

      expect(preInjectCallbackMock).toHaveBeenCalledTimes(2);
    });
  });
});
