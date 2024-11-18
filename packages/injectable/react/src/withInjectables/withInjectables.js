import React from 'react';
import { constant } from 'lodash/fp';
import { Observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { isPromise } from '@lensapp/fp';
import { getInjectable, lifecycleEnum } from '@lensapp/injectable';

export const diContext = React.createContext();

const { Provider: DiContextProvider, Consumer: DiContextConsumer } = diContext;

export { DiContextProvider };

export const componentNameMapInjectable = getInjectable({
  id: 'component-name-map',
  instantiate: () => new Map(),
});

export default (Component, { getPlaceholder = constant(null), getProps }) =>
  React.memo(
    React.forwardRef((props, ref) => (
      <DiContextConsumer>
        {({ di }) => {
          const componentNameMap = di.inject(componentNameMapInjectable);

          if (!componentNameMap.has(Component)) {
            componentNameMap.set(
              Component,
              Component.displayName ||
                Component.name ||
                `anonymous-component-${componentNameMap.size}`,
            );
          }

          const componentContext = {
            injectable: {
              id: componentNameMap.get(Component),
              lifecycle: lifecycleEnum.transient,
            },
          };

          const diForComponentContext = {
            ...di,

            inject: (alias, parameter) =>
              di.inject(alias, parameter, componentContext),

            injectMany: (injectionToken, parameter) =>
              di.injectMany(injectionToken, parameter, componentContext),
          };

          const maybeAsyncProps = getProps(diForComponentContext, props);
          const refProps = ref ? { ref } : {};

          if (!isPromise(maybeAsyncProps)) {
            return <Component {...refProps} {...maybeAsyncProps} />;
          }

          const observablePropsPromise = getObservablePromise(maybeAsyncProps);

          return (
            <Observer>
              {() => {
                const syncProps = observablePropsPromise.value;

                if (!syncProps) {
                  return getPlaceholder(props);
                }

                return <Component {...refProps} {...syncProps} />;
              }}
            </Observer>
          );
        }}
      </DiContextConsumer>
    )),
  );

const getObservablePromise = asyncValue => {
  const observableObject = observable({ value: null }, undefined, {
    deep: false,
  });

  asyncValue.then(
    action(syncValue => {
      observableObject.value = syncValue;
    }),
  );

  return observableObject;
};
