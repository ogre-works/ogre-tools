import * as React from 'react';
import { forwardRef, JSX, MutableRefObject } from 'react';
import { Plugin, PropsFromPluginTuple } from './plugin/plugin';
import { withMergeOutputOverInput } from './_private/with-merge-output-over-input';
import { fastPipeline } from './_private/fast-pipeline';
import { withMappedRef } from './_private/with-mapped-ref';

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
  const processedPlugins = plugins
    .map(withMappedRef)
    .map(withMergeOutputOverInput);

  return forwardRef((unprocessedProps, ref) => {
    const { $$ref = [], ...processedProps }: any = fastPipeline(
      unprocessedProps,
      ...processedPlugins,
    ) as JSX.IntrinsicElements[TagName];
    const callbackRef = React.useCallback(
      (node: HTMLElement) => [ref, ...$$ref].forEach(handleRefFor(node)),
      $$ref,
    );
    const TagName = tagName as React.ElementType;

    return <TagName {...processedProps} ref={callbackRef} />;
  });
}

const handleRefFor =
  (node: HTMLElement) =>
  (
    ref: ((node: HTMLElement) => void) | MutableRefObject<unknown> | undefined,
  ) => {
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
