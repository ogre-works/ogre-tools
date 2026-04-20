import { runInAction } from 'mobx';
import {
  atomsByTokenInjectable,
  computedInjectManyInjectable,
  computedInjectManyWithMetaInjectable,
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
  if (di.hasRegistrations(atomsByTokenInjectable)) {
    return;
  }

  runInAction(() => {
    di.register(
      atomsByTokenInjectable,
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
