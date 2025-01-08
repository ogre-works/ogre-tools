import React, { useState } from 'react';
import { constant } from 'lodash/fp';

import { isPromise } from '@lensapp/fp';
import { getInjectable, lifecycleEnum } from '@lensapp/injectable';

export const diContext = React.createContext();

const { Provider: DiContextProvider, Consumer: DiContextConsumer } = diContext;

export { DiContextProvider };

export const componentNameMapInjectable = getInjectable({
  id: 'component-name-map',
  instantiate: () => new Map(),
});

const ComponentOrPlaceholder = ({
  di,
  nonDependencyProps,
  getPlaceholder,
  getProps,
  Component,
  refProps,
}) => {
  const [propsState, setPropsState] = useState();

  React.useLayoutEffect(() => {
    const maybeAsyncProps = getProps(di, nonDependencyProps);

    if (isPromise(maybeAsyncProps)) {
      maybeAsyncProps.then(setPropsState);
    } else {
      setPropsState(maybeAsyncProps);
    }
  }, [nonDependencyProps]);

  if (!propsState) {
    return getPlaceholder(nonDependencyProps);
  }

  return <Component {...propsState} {...refProps} />;
};

export default (Component, { getPlaceholder = constant(null), getProps }) =>
  React.forwardRef((nonDependencyProps, ref) => (
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

        const refProps = ref ? { ref } : {};

        return (
          <ComponentOrPlaceholder
            di={diForComponentContext}
            nonDependencyProps={nonDependencyProps}
            getPlaceholder={getPlaceholder}
            getProps={getProps}
            Component={Component}
            refProps={refProps}
          />
        );
      }}
    </DiContextConsumer>
  ));
