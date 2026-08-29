import { runInAction } from 'mobx';
import {
  atomsByTokenInjectable,
  computedInjectMany2Injectable,
  computedInjectManyInjectable,
  computedInjectManyWithMeta2Injectable,
  computedInjectManyWithMetaInjectable,
  invalidateReactiveInstancesOnDeregisterCallback,
  invalidateReactiveInstancesOnRegisterCallback,
  reactiveInstancesInjectable,
  reactiveInstancesWithMetaInjectable,
} from './computedInjectMany';
import {
  _computedInjectMaybeInjectable,
  _computedInjectMaybeWithMetaInjectable,
  computedInjectMaybe2Injectable,
  computedInjectMaybeInjectable,
  computedInjectMaybeWithMeta2Injectable,
  computedInjectMaybeWithMetaInjectable,
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
      computedInjectMany2Injectable,
      computedInjectManyWithMeta2Injectable,
      computedInjectMaybeInjectable,
      computedInjectMaybe2Injectable,
      computedInjectMaybeWithMetaInjectable,
      computedInjectMaybeWithMeta2Injectable,
      _computedInjectMaybeInjectable,
      _computedInjectMaybeWithMetaInjectable,
      invalidateReactiveInstancesOnRegisterCallback,
      invalidateReactiveInstancesOnDeregisterCallback,
    );
  });
};
