import { ComponentType, MutableRefObject } from 'react';
import { Plugin, PropsFromPluginTuple } from './plugin/plugin';

type RefCallback<T> = (instance: T | null) => void;
type Ref<T> = RefCallback<T> | MutableRefObject<T | null> | null;

export type WrapperEntry<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  Component: ComponentType<TProps>;
  props: TProps;
};

export interface PluginsResult<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> {
  props: TProps;
  refs: Ref<HTMLElement>[];
  wrappers: WrapperEntry[];
}

export function getPropsFromPlugins<TProps extends Record<string, unknown>>(
  initialProps: TProps,
): PluginsResult<TProps>;

export function getPropsFromPlugins<PluginTuple extends readonly Plugin<any>[]>(
  initialProps: PropsFromPluginTuple<PluginTuple>,
  ...plugins: PluginTuple
): PluginsResult;

export function getPropsFromPlugins(
  initialProps: Record<string, unknown>,
  ...plugins: Plugin<Record<string, unknown>, Record<string, unknown>>[]
): PluginsResult {
  let currentProps = initialProps;
  const collectedRefs: Ref<HTMLElement>[] = [];
  const collectedWrappers: WrapperEntry[] = [];

  for (const plugin of plugins) {
    const output = plugin(currentProps) as Record<string, unknown>;

    const ref = output.ref as Ref<HTMLElement> | undefined;
    if (ref !== undefined) {
      if (ref !== null) {
        collectedRefs.push(ref);
      }
      output.ref = undefined;
    }

    const wrapper = output.$wrapper as WrapperEntry | undefined;
    if (wrapper !== undefined) {
      collectedWrappers.push(wrapper);
      output.$wrapper = undefined;
    }

    for (const key in currentProps) {
      if (!(key in output)) {
        output[key] = currentProps[key];
      }
    }

    for (const key in output) {
      if (output[key] === undefined) {
        delete output[key];
      }
    }

    currentProps = output;
  }

  return {
    props: currentProps,
    refs: collectedRefs,
    wrappers: collectedWrappers,
  };
}
