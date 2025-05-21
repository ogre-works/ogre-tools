/// <reference types="react" />
import {
  DiContainer,
  DiContainerForInjection,
  Injectable,
  InjectionToken,
} from '@lensapp/injectable';

export function useInject<TReturnValue>(
  injectable: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): Awaited<TReturnValue>;

export function useInject<TReturnValue, TInstantiationParameter>(
  injectable:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
  instantiationParameter: TInstantiationParameter,
): Awaited<TReturnValue>;

export function useInjectDeferred<TReturnValue>(
  injectable: Injectable<TReturnValue, any> | InjectionToken<TReturnValue>,
): Awaited<TReturnValue>;

export function useInjectDeferred<TReturnValue, TInstantiationParameter>(
  injectable:
    | Injectable<TReturnValue, any, TInstantiationParameter>
    | InjectionToken<TReturnValue, TInstantiationParameter>,
  instantiationParameter: TInstantiationParameter,
): Awaited<TReturnValue>;

export type InjectableComponent<Props extends object = {}> =
  React.ComponentType<Props> & Injectable<React.ComponentType<Props>>;

export function getInjectableComponent<
  Props extends TokenProps,
  TokenProps extends object,
>(
  injectable: Omit<
    Injectable<unknown>,
    'instantiate' | 'lifecycle' | 'scope' | 'decorable'
  > & {
    Component: React.ComponentType<Props>;
    PlaceholderComponent?: React.ComponentType<Props>;
    injectionToken?: InjectionToken<React.ComponentType<TokenProps>>;
  },
): InjectableComponent<Props>;

interface DiContainerProviderProps {
  di: DiContainer | DiContainerForInjection;
}

export const DiContextProvider: React.Provider<DiContainerProviderProps>;

export interface WithInjectablesSyncOptions<
  Dependencies extends object,
  Props extends object,
> {
  getProps: (di: DiContainerForInjection, props: Props) => Props & Dependencies;
}

export interface WithInjectablesAsyncOptions<
  Dependencies extends object,
  Props extends object,
> {
  getProps: (
    di: DiContainerForInjection,
    props: Props,
  ) => Promise<Props & Dependencies>;
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

export function registerInjectableReact(di: DiContainer): void;
