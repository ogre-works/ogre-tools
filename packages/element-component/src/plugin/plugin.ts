import { ArrayValues, UnionToIntersection } from 'type-fest';
import { Simplify } from 'type-fest';
import { Namespace } from '../_private/namespace';

export type Plugin<TInputProps = unknown, TOutputProps = unknown> = (
  props: TInputProps,
) => TOutputProps;

type PluginInputProp<T> = T extends Plugin<infer PluginInput, any>
  ? PluginInput
  : never;

type MapPluginInputProp<T extends readonly Plugin[]> = {
  [K in keyof T]: PluginInputProp<T[K]>;
};

export type PropsFromPluginTuple<PluginTuple extends readonly Plugin[]> =
  Simplify<UnionToIntersection<ArrayValues<MapPluginInputProp<PluginTuple>>>>;

type PluginInputPropsWithDependencies<
  TInputProps,
  TDependencyPluginTuple extends readonly Plugin[],
> = Simplify<TInputProps & PropsFromPluginTuple<TDependencyPluginTuple>>;

type WithUndefinedPluginValue<T> = {
  [K in keyof T & `${Namespace}${string}`]-?: undefined;
};

export function getPlugin<TInputProps>(
  plugin: Plugin<TInputProps, Simplify<WithUndefinedPluginValue<TInputProps>>>,
): Plugin<TInputProps>;

export function getPlugin<
  TInputProps,
  TDependencyPluginTuple extends readonly Plugin[],
>(
  plugin: Plugin<
    PluginInputPropsWithDependencies<TInputProps, TDependencyPluginTuple>,
    Simplify<WithUndefinedPluginValue<TInputProps>>
  >,
): Plugin<
  PluginInputPropsWithDependencies<TInputProps, TDependencyPluginTuple>
>;

export function getPlugin(plugin: any) {
  return plugin;
}
