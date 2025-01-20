import { ArrayValues, UnionToIntersection } from 'type-fest';
import { Simplify } from 'type-fest';

export type Plugin<TInputProps> = (props: TInputProps) => object;

type PluginInputProp<T> = T extends Plugin<infer PluginInput>
  ? PluginInput
  : never;

type MapPluginInputProp<T extends readonly Plugin<any>[]> = {
  [K in keyof T]: PluginInputProp<T[K]>;
};

export type PropsFromPluginTuple<PluginTuple extends readonly Plugin<any>[]> =
  Simplify<UnionToIntersection<ArrayValues<MapPluginInputProp<PluginTuple>>>>;

type PluginWithDependencies<
  TInputProps,
  TDependencyPluginTuple extends readonly Plugin<any>[],
> = Simplify<TInputProps & PropsFromPluginTuple<TDependencyPluginTuple>>;

export function getPlugin<TInputProps>(
  plugin: Plugin<TInputProps>,
): Plugin<TInputProps>;

export function getPlugin<
  TInputProps,
  TDependencyPluginTuple extends readonly Plugin<any>[],
>(
  plugin: Plugin<PluginWithDependencies<TInputProps, TDependencyPluginTuple>>,
): Plugin<PluginWithDependencies<TInputProps, TDependencyPluginTuple>>;

export function getPlugin(plugin: any) {
  return plugin;
}
