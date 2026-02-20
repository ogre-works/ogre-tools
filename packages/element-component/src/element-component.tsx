import * as React from 'react';
import { forwardRef, JSX, MutableRefObject, Ref } from 'react';
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
  ...plugins: Plugin<Record<string, unknown>, Record<string, unknown>>[]
) {
  const TagNameComponent = tagName as React.ElementType;

  return forwardRef(
    (unprocessedProps: Record<string, unknown>, ref: Ref<HTMLElement>) => {
      const { props: processedProps, refs } = runPlugins(
        unprocessedProps,
        plugins,
      );

      const callbackRef = React.useCallback(
        (node: HTMLElement | null) => {
          handleRef(node, ref);
          for (const pluginRef of refs) {
            handleRef(node, pluginRef);
          }
        },
        [ref, ...refs],
      );

      return <TagNameComponent {...processedProps} ref={callbackRef} />;
    },
  );
}

const handleRef = (
  node: HTMLElement | null,
  ref:
    | ((node: HTMLElement | null) => void)
    | MutableRefObject<HTMLElement | null>
    | null
    | undefined,
) => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
};
