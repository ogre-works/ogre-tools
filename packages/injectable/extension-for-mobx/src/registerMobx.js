import { runInAction } from 'mobx';
import {
  computedInjectManyInjectable,
  computedInjectManyWithMetaInjectable,
  invalidabilityForReactiveInstances,
  invalidateReactiveInstancesOnDeregisterCallback,
  invalidateReactiveInstancesOnRegisterCallback,
  reactiveInstancesInjectable,
  reactiveInstancesWithMetaInjectable,
} from './computedInjectMany';
import {
  _computedInjectMaybeInjectable,
  computedInjectMaybeInjectable,
} from './computedInjectMaybe';

export const registerMobX = di => {
  if (di.hasRegistrations(invalidabilityForReactiveInstances)) {
    return;
  }

  runInAction(() => {
    di.register(
      invalidabilityForReactiveInstances,
      reactiveInstancesInjectable,
      reactiveInstancesWithMetaInjectable,
      computedInjectManyInjectable,
      computedInjectManyWithMetaInjectable,
      computedInjectMaybeInjectable,
      _computedInjectMaybeInjectable,
      invalidateReactiveInstancesOnRegisterCallback,
      invalidateReactiveInstancesOnDeregisterCallback,
    );
  });
};
