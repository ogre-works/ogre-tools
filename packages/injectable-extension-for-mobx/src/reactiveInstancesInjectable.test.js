import {
  createContainer,
  getInjectable,
  getInjectionToken,
} from '@ogre-tools/injectable';

import {
  reactiveInstancesInjectable,
  registerMobX,
} from './reactiveInstancesInjectable';

import { configure, observe } from 'mobx';

configure({
  enforceActions: 'always',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
});

describe('registerMobx', () => {
  let reactiveInstances;

  describe('given the MobX extension is registered, and there is injection token and implementations of it, when injected as reactive', () => {
    let di;
    let actual;
    let someFirstInjectionToken;
    let someOtherInjectable;
    let reactionCountForFirstToken;

    beforeEach(() => {
      reactionCountForFirstToken = 0;

      someFirstInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someFirstInjectionToken,
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'some-other-instance',
        injectionToken: someFirstInjectionToken,
      });

      di = createContainer();

      registerMobX(di);

      actual = di.inject(reactiveInstancesInjectable, {
        injectionToken: someFirstInjectionToken,
      });

      observe(
        actual,

        change => {
          reactionCountForFirstToken++;
          reactiveInstances = change.newValue;
        },
      );

      di.register(someInjectable, someOtherInjectable);
    });

    it('injects reactive instances', () => {
      expect(reactiveInstances).toEqual([
        'some-instance',
        'some-other-instance',
      ]);
    });

    it('when a new implementation gets registered, the reactive instances react', () => {
      const someIrrelevantInjectable = getInjectable({
        id: 'some-irrelevant-injectable',
        instantiate: () => 'irrelevant',
      });

      const someAnotherInjectable = getInjectable({
        id: 'some-another-injectable',
        instantiate: () => 'some-another-instance',
        injectionToken: someFirstInjectionToken,
      });

      di.register(someIrrelevantInjectable, someAnotherInjectable);

      expect(reactiveInstances).toEqual([
        'some-instance',
        'some-other-instance',
        'some-another-instance',
      ]);
    });

    it('when an existing implementation gets deregistered, the reactive instances react', () => {
      const someIrrelevantInjectable = getInjectable({
        id: 'some-irrelevant-injectable',
        instantiate: () => 'irrelevant',
      });

      di.register(someIrrelevantInjectable);

      di.deregister(someIrrelevantInjectable, someOtherInjectable);

      expect(reactiveInstances).toEqual(['some-instance']);
    });

    it('when registering multiple new implementations for the token, causes only one reaction', () => {
      const someNewInjectable1 = getInjectable({
        id: 'some-injectable-1',
        instantiate: () => 'irrelevant',
        injectionToken: someFirstInjectionToken,
      });

      const someNewInjectable2 = getInjectable({
        id: 'some-injectable-2',
        instantiate: () => 'irrelevant',
        injectionToken: someFirstInjectionToken,
      });

      reactionCountForFirstToken = 0;

      di.register(someNewInjectable1, someNewInjectable2);

      expect(reactionCountForFirstToken).toBe(1);
    });

    describe('given second injection token and implementations, when injected as reactive', () => {
      let reactiveInstancesForSecondToken;

      beforeEach(() => {
        const someSecondInjectionToken = getInjectionToken({
          id: 'some-second-injection-token',
        });

        const someInjectableForSecondInjectionToken = getInjectable({
          id: 'some-injectable-for-second-injection-token',
          instantiate: () => 'some-instance-for-second-token',
          injectionToken: someSecondInjectionToken,
        });

        const actual = di.inject(reactiveInstancesInjectable, {
          injectionToken: someSecondInjectionToken,
        });

        observe(
          actual,

          change => {
            reactiveInstancesForSecondToken = change.newValue;
          },
        );

        reactionCountForFirstToken = 0;

        di.register(someInjectableForSecondInjectionToken);
      });

      it('injects only related implementations', () => {
        expect(reactiveInstancesForSecondToken).toEqual([
          'some-instance-for-second-token',
        ]);
      });

      it('does not cause reaction in reactive instances of unrelated injection token', () => {
        expect(reactionCountForFirstToken).toBe(0);
      });
    });
  });
});
