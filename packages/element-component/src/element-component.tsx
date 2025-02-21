import * as React from 'react';
import { Plugin, PropsFromPluginTuple } from './plugin/plugin';
import { withMergeOutputOverInput } from './_private/with-merge-output-over-input';
import { fastPipeline } from './_private/fast-pipeline';
import { forwardRef } from 'react';

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
  const processedPlugins = plugins.map(withMergeOutputOverInput);

  return forwardRef((unprocessedProps: any, ref) => {
    const processedProps = fastPipeline(
      unprocessedProps,
      ...processedPlugins,
    ) as JSX.IntrinsicElements[TagName];

    const TagName = tagName as React.ElementType;

    return <TagName ref={ref} {...processedProps} />;
  });
}
