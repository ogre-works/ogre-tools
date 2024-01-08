/// <reference types="react" />
import type {
  DiContainer,
  DiContainerForInjection,
} from '@lensapp/injectable';
import { IComputedValue } from 'mobx';

interface DiContainerProviderProps {
  di: DiContainer | DiContainerForInjection;
}

export const DiContextProvider: React.Provider<DiContainerProviderProps>;

export interface WithInjectablesSyncOptions<
  Dependencies extends object,
  Props extends object,
> {
  getProps: (di: DiContainer, props: Props) => Props & Dependencies;
}

export interface WithInjectablesAsyncOptions<
  Dependencies extends object,
  Props extends object,
> {
  getProps: (di: DiContainer, props: Props) => Promise<Props & Dependencies>;
  getPlaceholder: React.FunctionComponent<Props>;
}

export interface WithInjectables {
  <Dependencies extends object, Props extends object = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: WithInjectablesSyncOptions<Dependencies, Props>,
  ): React.FunctionComponent<Props>;

  <Dependencies extends object, Props extends object, Ref extends object>(
    Component: React.ForwardRefExoticComponent<
      Dependencies & Props & React.RefAttributes<Ref>
    >,
    options: WithInjectablesSyncOptions<Dependencies, Props>,
  ): React.ForwardRefExoticComponent<Props & React.RefAttributes<Ref>>;

  <Dependencies extends object, Props extends object = {}>(
    Component: React.ElementType<Dependencies & Props>,
    options: WithInjectablesAsyncOptions<Dependencies, Props>,
  ): React.FunctionComponent<Props>;

  <Dependencies extends object, Props extends object, Ref extends object>(
    Component: React.ForwardRefExoticComponent<
      Dependencies & Props & React.RefAttributes<Ref>
    >,
    options: WithInjectablesAsyncOptions<Dependencies, Props>,
  ): React.ForwardRefExoticComponent<Props & React.RefAttributes<Ref>>;
}

export const withInjectables: WithInjectables;

export type IAsyncComputed<T> = {
  value: IComputedValue<T>;
  pending: IComputedValue<boolean>;
  invalidate: () => void;
};

type AsyncComputedParams<T> = {
  getValueFromObservedPromise: () => Promise<T>;
  valueWhenPending?: T;
  betweenUpdates?: 'show-pending-value' | 'show-latest-value';
};

export function asyncComputed<T>(
  configuration: AsyncComputedParams<T>,
): IAsyncComputed<T>;

export function registerInjectableReact(di: DiContainer): void;
