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
      const {
        props: processedProps,
        refs,
        wrappers,
      } = runPlugins(unprocessedProps, plugins);

      const wrapperRefContributions = React.useRef<
        ((node: HTMLElement | null) => void)[]
      >([]);
      wrapperRefContributions.current = [];

      const contributeRef = React.useCallback(
        (refCallback: (node: HTMLElement | null) => void) => {
          wrapperRefContributions.current.push(refCallback);
        },
        [],
      );

      const elementPropsRef = React.useRef<Record<string, unknown>>({});
      elementPropsRef.current = { ...processedProps };

      const contributeProps = React.useCallback(
        (props: Record<string, unknown>) => {
          for (const key in props) {
            const existing = elementPropsRef.current[key];
            const incoming = props[key];

            if (
              typeof existing === 'function' &&
              typeof incoming === 'function'
            ) {
              const prev = existing as (...args: unknown[]) => void;
              const next = incoming as (...args: unknown[]) => void;

              elementPropsRef.current[key] = (...args: unknown[]) => {
                prev(...args);
                next(...args);
              };
            } else {
              elementPropsRef.current[key] = incoming;
            }
          }
        },
        [],
      );

      const callbackRef = React.useCallback(
        (node: HTMLElement | null) => {
          handleRef(node, ref);
          for (const pluginRef of refs) {
            handleRef(node, pluginRef);
          }
          for (const wrapperRef of wrapperRefContributions.current) {
            wrapperRef(node);
          }
        },
        [ref, ...refs, wrappers.length],
      );

      if (wrappers.length === 0) {
        return <TagNameComponent {...processedProps} ref={callbackRef} />;
      }

      let element: React.ReactElement = (
        <DeferredElement
          elementPropsRef={elementPropsRef}
          callbackRef={callbackRef}
          TagName={TagNameComponent}
        />
      );

      for (const { Component, props: wrapperProps } of wrappers) {
        element = (
          <Component
            {...wrapperProps}
            contributeRef={contributeRef}
            contributeProps={contributeProps}
          >
            {element}
          </Component>
        );
      }

      return element;
    },
  );
}

const DeferredElement = ({
  elementPropsRef,
  callbackRef,
  TagName,
}: {
  elementPropsRef: React.MutableRefObject<Record<string, unknown>>;
  callbackRef: (node: HTMLElement | null) => void;
  TagName: React.ElementType;
}) => <TagName {...elementPropsRef.current} ref={callbackRef} />;

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
