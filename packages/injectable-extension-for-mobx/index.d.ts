import {
  DiContainer,
  Injectable,
  InjectionToken,
} from '@ogre-tools/injectable';
import { IComputedValue } from 'mobx';

export function registerMobX(di: DiContainer): void;

export const computedInjectManyInjectable: Injectable<
  <
    TInjectionToken extends InjectionToken<any, any>,
    TInstance = TInjectionToken extends InjectionToken<infer T, any>
      ? T
      : never,
  >(
    injectionToken: TInjectionToken,
  ) => IComputedValue<TInstance[]>,
  unknown,
  void
>;
