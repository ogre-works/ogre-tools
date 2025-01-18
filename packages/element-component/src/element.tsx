import React from 'react';
import { fromPairs, toPairs, reject } from 'lodash/fp';
import { pipeline } from '@lensapp/fp';
import { ArrayValues, UnionToIntersection } from 'type-fest';

export type Namespace = '$';
const NAMESPACE: Namespace = '$' as const;

export type DataAttributes = {
  [key: `data-${string}`]: string | undefined;
};

export type AllHtmlAttributes = React.AllHTMLAttributes<HTMLElement>;
export type AllHtmlAttributesAndDataAttributes = AllHtmlAttributes &
  DataAttributes;

export type Plugin<
  TInputProps extends AllHtmlAttributesAndDataAttributes,
  TOutputProps extends AllHtmlAttributesAndDataAttributes,
> = (props: TInputProps) => TOutputProps;

export function getPlugin<
  TInputProps extends AllHtmlAttributesAndDataAttributes,
  TOutputProps extends AllHtmlAttributesAndDataAttributes,
>(plugin: Plugin<TInputProps, TOutputProps>): Plugin<TInputProps, TOutputProps>;

export function getPlugin<
  TDependentInput extends TDependencyInput & AllHtmlAttributesAndDataAttributes,
  TDependentOutput extends TDependencyInput &
    AllHtmlAttributesAndDataAttributes,
  TDependencyInput extends AllHtmlAttributesAndDataAttributes,
  TDependencyOutput extends AllHtmlAttributesAndDataAttributes,
>(
  plugin: Plugin<TDependentInput, TDependentOutput>,
  dependency: Plugin<TDependencyInput, TDependencyOutput>,
): Plugin<TDependentInput, TDependentOutput>;

export function getPlugin(...args: any[]) {
  return args[0];
}

export type ElementComponent<
  TTagName extends keyof JSX.IntrinsicElements,
  TProps = {},
> = React.ComponentType<TProps & JSX.IntrinsicElements[TTagName]>;

type PluginInputProp<T> = T extends Plugin<infer PluginInput, any>
  ? PluginInput
  : never;

type MapPluginInputProp<T extends readonly Plugin<any, any>[]> = {
  [K in keyof T]: PluginInputProp<T[K]>;
};

export function getElementComponent<
  TTagName extends keyof JSX.IntrinsicElements,
>(tagName: TTagName): ElementComponent<TTagName>;

export function getElementComponent<
  TTagName extends keyof JSX.IntrinsicElements,
  PluginTuple extends readonly Plugin<any, any>[],
>(
  tagName: TTagName,
  ...plugins: PluginTuple
): ElementComponent<
  TTagName,
  UnionToIntersection<ArrayValues<MapPluginInputProp<PluginTuple>>>
>;

export function getElementComponent<
  TagName extends keyof JSX.IntrinsicElements,
>(tagName: TagName, ...plugins: any[]) {
  const processedPlugins = plugins.map(withMergeOutputOverInput);

  return (unprocessedProps: any) => {
    const processedProps = pipeline(
      unprocessedProps,
      // @ts-ignore
      ...processedPlugins,
      rejectKeys(isNamespaced),
    ) as JSX.IntrinsicElements[TagName];

    const TagName = tagName as React.ElementType;

    return <TagName {...processedProps} />;
  };
}

const isNamespaced = ([propName]: [string, any]) =>
  propName.startsWith(NAMESPACE);

const withMergeOutputOverInput = (toBeDecorated: any) => (input: any) => {
  const output = toBeDecorated(input);

  return { ...input, ...output };
};

const rejectKeys = (predicate: any) => (input: any) =>
  pipeline(
    input,
    toPairs,
    reject(x => predicate(x[0])),
    fromPairs,
  );
