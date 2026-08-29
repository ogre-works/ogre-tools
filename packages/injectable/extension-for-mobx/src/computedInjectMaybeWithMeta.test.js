import { autorun, configure, onReactionError, runInAction } from 'mobx';

import {
  createContainer,
  getInjectable,
  getInjectionToken,
  getInjectionToken2,
} from '@ogre-tools/injectable';

import {
  computedInjectMaybeWithMeta2InjectionToken,
  computedInjectMaybeWithMetaInjectionToken,
} from './computedInjectMaybe';

import { registerMobX } from './registerMobx';

describe('computedInjectMaybeWithMeta', () => {
  let di;
  let someInjectionToken;
  let computedInjectMaybeWithMeta;

  beforeEach(() => {
    configure({
      enforceActions: 'always',
      computedRequiresReaction: true,
      reactionRequiresObservable: true,
      observableRequiresReaction: true,
    });

    di = createContainer('some-container');

    registerMobX(di);

    someInjectionToken = getInjectionToken({
      id: 'some-injection-token',
    });

    computedInjectMaybeWithMeta = di.inject(
      computedInjectMaybeWithMetaInjectionToken,
    );
  });

  it('given no implementation is registered, when observed, resolves to undefined', () => {
    let actual;

    const stop = autorun(() => {
      actual = computedInjectMaybeWithMeta(someInjectionToken).get();
    });

    expect(actual).toBe(undefined);

    stop();
  });

  it('given an implementation is registered, when observed, resolves to the meta-wrapped instance', () => {
    let actual;

    runInAction(() => {
      di.register(
        getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-instance',
          injectionToken: someInjectionToken,
        }),
      );
    });

    const stop = autorun(() => {
      actual = computedInjectMaybeWithMeta(someInjectionToken).get();
    });

    expect(actual).toEqual({
      instance: 'some-instance',
      meta: { id: 'some-injectable' },
    });

    stop();
  });

  it('given an implementation registered while observing, resolves reactively to the meta-wrapped instance', () => {
    let actual;

    const stop = autorun(() => {
      actual = computedInjectMaybeWithMeta(someInjectionToken).get();
    });

    expect(actual).toBe(undefined);

    runInAction(() => {
      di.register(
        getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-instance',
          injectionToken: someInjectionToken,
        }),
      );
    });

    expect(actual).toEqual({
      instance: 'some-instance',
      meta: { id: 'some-injectable' },
    });

    stop();
  });

  it('given more than one implementation is registered, when observed, the reaction errors naming the contributions', () => {
    runInAction(() => {
      di.register(
        getInjectable({
          id: 'some-injectable',
          instantiate: () => 'some-instance',
          injectionToken: someInjectionToken,
        }),

        getInjectable({
          id: 'some-other-injectable',
          instantiate: () => 'some-other-instance',
          injectionToken: someInjectionToken,
        }),
      );
    });

    let actualError;
    const stopListening = onReactionError(error => {
      actualError = error.message;
    });
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const stop = autorun(() => {
      computedInjectMaybeWithMeta(someInjectionToken).get();
    });

    stop();
    stopListening();
    consoleErrorSpy.mockRestore();

    expect(actualError).toBe(
      'Tried to computedInjectMaybeWithMeta "some-injection-token", but more than one contribution was encountered: "some-injectable", "some-other-injectable"',
    );
  });

  it('given a v2 token of a non-maybe cardinality, when injected, throws', () => {
    const someManyToken = getInjectionToken2({
      id: 'some-many-token',
      cardinality: 'zero-or-many',
    })();

    expect(() => {
      computedInjectMaybeWithMeta(someManyToken);
    }).toThrow(
      'Tried to computedInjectMaybeWithMeta "some-many-token", but its cardinality is "zero-or-many" instead of "zero-or-one".',
    );
  });

  describe('the factory-shape variant', () => {
    let computedInjectMaybeWithMeta2;

    beforeEach(() => {
      computedInjectMaybeWithMeta2 = di.inject2(
        computedInjectMaybeWithMeta2InjectionToken,
      );
    });

    it('when invoked within a reactive context, resolves to the meta-wrapped instance', () => {
      let actual;

      runInAction(() => {
        di.register(
          getInjectable({
            id: 'some-injectable',
            instantiate: () => 'some-instance',
            injectionToken: someInjectionToken,
          }),
        );
      });

      const getMaybeInstanceWithMeta =
        computedInjectMaybeWithMeta2(someInjectionToken);

      const stop = autorun(() => {
        actual = getMaybeInstanceWithMeta();
      });

      expect(actual).toEqual({
        instance: 'some-instance',
        meta: { id: 'some-injectable' },
      });

      stop();
    });
  });
});
