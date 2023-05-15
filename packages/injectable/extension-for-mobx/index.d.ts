import {
  DiContainer,
  Injectable,
  InjectionInstanceWithMeta,
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
  unknown
>;

export const computedInjectManyWithMetaInjectable: Injectable<
  <
    TInjectionToken extends InjectionToken<any, any>,
    TInstanceWithMeta = TInjectionToken extends InjectionToken<infer T, any>
      ? InjectionInstanceWithMeta<T>
      : never,
  >(
    injectionToken: TInjectionToken,
  ) => IComputedValue<TInstanceWithMeta[]>,
  unknown
>;
