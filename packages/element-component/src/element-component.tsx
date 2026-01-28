import * as React from 'react';
import { forwardRef, JSX, MutableRefObject } from 'react';
import { Plugin, PropsFromPluginTuple } from './plugin/plugin';
import { runPlugins } from './_private/run-plugins';

export type TagNames = keyof JSX.IntrinsicElements;

export type ElementComponent<
  TTagName extends TagNames,
  TProps = {},
> = React.ComponentType<TProps & JSX.IntrinsicElements[TTagName]>;

export function getElementComponent<TTagName extends TagNames>(
  tagName: TTagName,
): ElementComponent<TTagName>;

export function getElementComponent<
  TTagName extends TagNames,
  PluginTuple extends readonly Plugin<any>[],
>(
  tagName: TTagName,
  ...plugins: PluginTuple
): ElementComponent<TTagName, PropsFromPluginTuple<PluginTuple>>;

export function getElementComponent<TagName extends TagNames>(
  tagName: TagName,
  ...plugins: any[]
) {
  const TagNameComponent = tagName as React.ElementType;

  if (plugins.length === 0) {
    // Fast path: no plugins, just forward everything
    return forwardRef((props, ref) => (
      <TagNameComponent {...props} ref={ref} />
    ));
  }

  return forwardRef((unprocessedProps, ref) => {
    // Run all plugins in a single optimized pass
    const { props: processedProps, refs } = runPlugins(
      unprocessedProps,
      plugins,
    );

    const callbackRef = React.useCallback(
      (node: HTMLElement) => {
        handleRef(node, ref);
        for (let i = 0; i < refs.length; i++) {
          handleRef(node, refs[i]);
        }
      },
      [ref, ...refs],
    );

    return <TagNameComponent {...processedProps} ref={callbackRef} />;
  });
}

const handleRef = (
  node: HTMLElement,
  ref:
    | ((node: HTMLElement) => void)
    | MutableRefObject<unknown>
    | null
    | undefined,
) => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
};
