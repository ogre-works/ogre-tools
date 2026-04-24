import { ComponentType, MutableRefObject } from 'react';
import { Plugin } from '../plugin/plugin';

type RefCallback<T> = (instance: T | null) => void;
type Ref<T> = RefCallback<T> | MutableRefObject<T | null> | null;

export type WrapperEntry = {
  Component: ComponentType<any>;
  props: Record<string, unknown>;
};

interface PluginResult {
  props: Record<string, unknown>;
  refs: Ref<HTMLElement>[];
  wrappers: WrapperEntry[];
}

/**
 * Runs all plugins in a single pass, collecting refs, wrappers, and merging props.
 * Plugins can set props to undefined to remove them from the output.
 */
export const runPlugins = (
  initialProps: Record<string, unknown>,
  plugins: Plugin<Record<string, unknown>, Record<string, unknown>>[],
): PluginResult => {
  let currentProps = initialProps;
  const collectedRefs: Ref<HTMLElement>[] = [];
  const collectedWrappers: WrapperEntry[] = [];

  for (const plugin of plugins) {
    const output = plugin(currentProps) as Record<string, unknown>;

    // Handle ref collection
    const ref = output.ref as Ref<HTMLElement> | undefined;
    if (ref !== undefined) {
      if (ref !== null) {
        collectedRefs.push(ref);
      }
      output.ref = undefined;
    }

    // Handle $wrapper collection
    const wrapper = output.$wrapper as WrapperEntry | undefined;
    if (wrapper !== undefined) {
      collectedWrappers.push(wrapper);
      output.$wrapper = undefined;
    }

    // Merge input props into output (output takes precedence)
    for (const key in currentProps) {
      if (!(key in output)) {
        output[key] = currentProps[key];
      }
    }

    // Remove undefined values (plugins set props to undefined to clean them up)
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
};
