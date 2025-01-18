import type { RenderResult } from '@testing-library/react';
import { fireEvent, prettyDOM } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { isEmpty } from 'lodash/fp';
import { act } from 'react';
import { flushPromises } from '@lensapp/ogre-test-utils';

type DiscoverySourceTypes = RenderResult | Element | Element[];

export type Actionable = {
  type: (data: string) => Promise<void>;
  click: () => Promise<void>;
  rightClick: () => Promise<void>;
  doubleClick: () => Promise<void>;
  hover: () => Promise<void>;
  unhover: () => Promise<void>;
};
export type Attributable = {
  readonly attributeValue: string | null;
  getAttribute: (name: string) => string | null;
};
export type Discovered = { readonly discovered: Element } & Discover &
  Actionable &
  Attributable;
export type MaybeDiscovered = {
  readonly discovered: Element | null;
} & Discover &
  Actionable;
export type QueryManyDiscovered = {
  readonly discovered: Element[];
  readonly attributeValues: string[];
  getAttributes: (name: string) => (string | null)[];
  getSingleElement: GetSingleElement;
};

export type QuerySingleElement = (
  attributeName: string,
  attributeValue?: string,
) => MaybeDiscovered;
export type GetSingleElement = (
  attributeName: string,
  attributeValue?: string,
) => Discovered;
export type QueryAllElements = (
  attributeName: string,
  attributeValue?: string,
) => QueryManyDiscovered;

export interface Discover {
  querySingleElement: QuerySingleElement;
  queryAllElements: QueryAllElements;
  getSingleElement: GetSingleElement;
}

const getBaseElement = (source: DiscoverySourceTypes) =>
  'baseElement' in source ? source.baseElement : source;

declare global {
  interface DateConstructor {
    /* Jest uses @sinonjs/fake-timers, that add this flag */
    readonly isFake: boolean | undefined;
  }
}

const multiPrettyDom = (getSource: () => DiscoverySourceTypes) =>
  [getBaseElement(getSource())]
    .flat()
    .map(value => prettyDOM(value, Infinity))
    .join('\n');

export function querySingleElement(
  getSource: () => DiscoverySourceTypes,
): QuerySingleElement {
  return (attributeName, attributeValue) => {
    const source = getSource();
    const dataAttribute = `data-${attributeName}-test`;
    const selector = attributeValue
      ? `[${dataAttribute}="${attributeValue}"]`
      : `[${dataAttribute}]`;
    const [discovered = null, ...discoveredExcess] = [getBaseElement(source)]
      .flat()
      .flatMap(elem => [
        elem.matches(selector) ? elem : undefined,
        ...elem.querySelectorAll(selector),
      ])
      .filter(x => x);

    function ensureDiscovered(
      discovered: Element | null,
    ): asserts discovered is Element {
      if (!discovered) {
        throw new Error(
          `Tried to click "${selector}", but it didn't exist.\n\nHTML is:\n\n${multiPrettyDom(
            getSource,
          )}`,
        );
      }
    }

    if (!isEmpty(discoveredExcess)) {
      throw new Error(
        `Tried to discover single "${selector}", but found multiple matches.\n\nHTML is:\n\n${multiPrettyDom(
          getSource,
        )}`,
      );
    }

    const nestedDiscover = discoverFor(() => {
      if (!discovered) {
        throw new Error(
          'Tried to do nested discover using source that does not exist',
        );
      }

      return discovered;
    });
    const isUsingFakeTime = !!global.Date.isFake;
    const configuredUserEvents = userEvent.setup({
      advanceTimers: isUsingFakeTime ? jest.advanceTimersByTimeAsync : () => {},
    });

    const mouseUserEventAction =
      (
        action:
          | 'clear'
          | 'click'
          | 'dblClick'
          | 'hover'
          | 'tripleClick'
          | 'unhover',
      ) =>
      async () => {
        ensureDiscovered(discovered);

        await act(async () => {
          await configuredUserEvents[action](discovered);

          await flushPromises();
        });
      };

    const click = mouseUserEventAction('click');
    const doubleClick = mouseUserEventAction('dblClick');
    const hover = mouseUserEventAction('hover');

    const unhover = async () => {
      // NOTE: This does not use the build in convenience function, as that one does not seem to fire the events consistently
      ensureDiscovered(discovered);
      fireEvent.mouseOut(discovered);
      fireEvent.mouseLeave(discovered);
    };

    const rightClick = async () => {
      ensureDiscovered(discovered);

      await act(async () => {
        await configuredUserEvents.pointer([
          { target: discovered },
          { target: discovered, keys: '[MouseRight]' },
        ]);
      });
    };

    return {
      discovered,
      click,
      rightClick,
      doubleClick,
      hover,
      unhover,
      type: async data => {
        ensureDiscovered(discovered);

        // TODO: remove these two lines once https://github.com/testing-library/user-event/issues/1002 is fixed
        await act(async () => {
          await configuredUserEvents.click(discovered);
        });

        await act(async () => {
          (discovered as HTMLElement).focus();
        });

        await act(async () => {
          await configuredUserEvents.type(discovered, data, {
            skipClick: true,
          });
        });
      },
      ...nestedDiscover,
    };
  };
}

export function queryAllElements(
  getSource: () => DiscoverySourceTypes,
): QueryAllElements {
  return (attributeName, attributeValue) => {
    const source = getSource();
    const dataAttribute = `data-${attributeName}-test`;
    const selector = attributeValue
      ? `[${dataAttribute}="${attributeValue}"]`
      : `[${dataAttribute}]`;
    const results = [getBaseElement(source)]
      .flat()
      .flatMap(elem => [...elem.querySelectorAll(selector)]);

    return {
      discovered: results,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      attributeValues: results.map(
        result => result.getAttribute(dataAttribute)!,
      ),
      getAttributes: name =>
        results.map(result => result.getAttribute(`data-${name}-test`)),
      getSingleElement: getSingleElement(() => results),
    };
  };
}

export function getSingleElement(
  getSource: () => DiscoverySourceTypes,
): GetSingleElement {
  return (attributeName, attributeValue) => {
    const dataAttribute = `data-${attributeName}-test`;

    const { discovered, ...nestedDiscover } = querySingleElement(getSource)(
      attributeName,
      attributeValue,
    );

    if (!discovered) {
      const html = multiPrettyDom(getSource);

      if (attributeValue) {
        const validValues =
          queryAllElements(getSource)(attributeName).attributeValues;
        const formattedValidValues =
          validValues.map(data => ` - "${data}"`).join('\n') ||
          'NO VALUES FOUND';

        throw new Error(
          [
            `Couldn't find HTML-element with attribute "${dataAttribute}" with value "${attributeValue}".`,
            `Present values are:`,
            formattedValidValues,
            `HTML is:`,
            html,
          ].join('\n\n'),
        );
      }

      throw new Error(
        `Couldn't find HTML-element with attribute "${dataAttribute}"\n\nHTML is:\n\n${html}`,
      );
    }

    return {
      discovered,
      ...nestedDiscover,
      attributeValue: discovered.getAttribute(dataAttribute),
      getAttribute: name => discovered.getAttribute(`data-${name}-test`),
    };
  };
}

export function discoverFor(getSource: () => DiscoverySourceTypes): Discover {
  return {
    querySingleElement: querySingleElement(getSource),
    queryAllElements: queryAllElements(getSource),
    getSingleElement: getSingleElement(getSource),
  };
}
