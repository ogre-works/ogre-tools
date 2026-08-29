import createContainer from '../dependency-injection-container/createContainer';
import getInjectable2 from '../getInjectable2/getInjectable2';
import { getInjectionToken2 } from '../getInjectionToken2/getInjectionToken2';

describe('createContainer.injectMaybeWithMeta', () => {
  let di;
  let someMaybeToken;

  beforeEach(() => {
    di = createContainer('some-container');

    someMaybeToken = getInjectionToken2({
      id: 'some-maybe-token',
      cardinality: 'zero-or-one',
    })();
  });

  describe('given a token with cardinality "zero-or-one"', () => {
    it('when no implementation is registered, injecting maybe with meta returns undefined', () => {
      expect(di.injectMaybeWithMeta2(someMaybeToken)()).toBe(undefined);
    });

    it('when an implementation is registered, injecting maybe with meta returns the meta-wrapped instance', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken,
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(di.injectMaybeWithMeta2(someMaybeToken)()).toEqual({
        instance: 'some-instance',
        meta: { id: 'some-injectable' },
      });
    });

    it('when the factory is obtained before the implementation is registered, invoking it afterwards returns the meta-wrapped instance', () => {
      const getMaybeInstanceWithMeta = di.injectMaybeWithMeta2(someMaybeToken);

      expect(getMaybeInstanceWithMeta()).toBe(undefined);

      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken,
          instantiate: () => () => 'some-instance',
        }),
      );

      expect(getMaybeInstanceWithMeta()).toEqual({
        instance: 'some-instance',
        meta: { id: 'some-injectable' },
      });
    });

    it('when injecting maybe with meta from within an injectable, works the same', () => {
      di.register(
        getInjectable2({
          id: 'some-injectable',
          injectionToken: someMaybeToken,
          instantiate: () => () => 'some-instance',
        }),
      );

      const someConsumer = getInjectable2({
        id: 'some-consumer',
        consumptions: [someMaybeToken],

        instantiate: di => {
          const getMaybeInstanceWithMeta =
            di.injectMaybeWithMeta(someMaybeToken);

          return () => getMaybeInstanceWithMeta();
        },
      });

      di.register(someConsumer);

      expect(di.inject(someConsumer)).toEqual({
        instance: 'some-instance',
        meta: { id: 'some-injectable' },
      });
    });

    it('given an injectable not declaring the token, when injecting maybe with meta from within it, throws', () => {
      const someConsumer = getInjectable2({
        id: 'some-consumer',

        instantiate: di => {
          di.injectMaybeWithMeta(someMaybeToken)();

          return () => 'irrelevant';
        },
      });

      di.register(someConsumer);

      expect(() => {
        di.inject(someConsumer);
      }).toThrow(
        'Tried to inject "some-maybe-token" from "some-consumer", but it is not a declared consumption.',
      );
    });
  });

  describe.each(['one', 'zero-or-many', 'one-or-many'])(
    'given a token with cardinality "%s"',
    cardinality => {
      it('when injecting maybe with meta, throws', () => {
        const someToken = getInjectionToken2({
          id: 'some-token',
          cardinality,
        })();

        expect(() => {
          di.injectMaybeWithMeta2(someToken);
        }).toThrow(
          `Tried to injectMaybe "some-token" from "some-container", but its cardinality is "${cardinality}" instead of "zero-or-one".`,
        );
      });
    },
  );
});
