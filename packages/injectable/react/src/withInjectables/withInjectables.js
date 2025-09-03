import React, { useMemo, useState } from 'react';
import { constant } from 'lodash/fp';

import { isPromise } from '@lensapp/fp';
export const diContext = React.createContext();

const { Provider: DiContextProvider, Consumer: DiContextConsumer } = diContext;

export { DiContextProvider };

const ComponentOrPlaceholder = ({
  di,
  nonDependencyProps,
  getPlaceholder,
  getProps,
  Component,
  refProps,
}) => {
  const diForComponentContext = useMemo(() => {
    return {
      ...di,

      inject: (alias, parameter) => di.inject(alias, parameter, {}),

      injectMany: (injectionToken, parameter) =>
        di.injectMany(injectionToken, parameter, {}),
    };
  }, [di]);

  const [propsState, setPropsState] = useState();

  React.useLayoutEffect(() => {
    const maybeAsyncProps = getProps(diForComponentContext, nonDependencyProps);

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
      {di => {
        const refProps = ref ? { ref } : {};

        return (
          <ComponentOrPlaceholder
            di={di}
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
