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
    let someInjectionToken;
    let someOtherInjectable;

    beforeEach(() => {
      someInjectionToken = getInjectionToken({
        id: 'some-injection-token',
      });

      const someInjectable = getInjectable({
        id: 'some-injectable',
        instantiate: () => 'some-instance',
        injectionToken: someInjectionToken,
      });

      someOtherInjectable = getInjectable({
        id: 'some-other-injectable',
        instantiate: () => 'some-other-instance',
        injectionToken: someInjectionToken,
      });

      di = createContainer();

      registerMobX(di);

      di.register(someInjectable);
      di.register(someOtherInjectable);

      actual = di.inject(reactiveInstancesInjectable, {
        injectionToken: someInjectionToken,
      });

      observe(
        actual,

        change => {
          reactiveInstances = change.newValue;
        },

        true,
      );
    });

    it('injects reactive instances', () => {
      expect(reactiveInstances).toEqual([
        'some-instance',
        'some-other-instance',
      ]);
    });

    it('when a new implementation gets registered, the reactive instances react', () => {
      const someAnotherInjectable = getInjectable({
        id: 'some-another-injectable',
        instantiate: () => 'some-another-instance',
        injectionToken: someInjectionToken,
      });

      di.register(someAnotherInjectable);

      expect(reactiveInstances).toEqual([
        'some-instance',
        'some-other-instance',
        'some-another-instance',
      ]);
    });

    it('when an existing implementation gets deregistered, the reactive instances react', () => {
      di.deregister(someOtherInjectable);

      expect(reactiveInstances).toEqual(['some-instance']);
    });
  });
});
