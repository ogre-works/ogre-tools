import React, { Suspense, forwardRef, useContext } from 'react';

import { getInjectable } from '@lensapp/injectable';
import { useInject } from '../useInject/useInject';
import {
  diContext,
  DiContextProvider,
} from '../withInjectables/withInjectables';

export const getInjectableComponent = ({
  Component,
  PlaceholderComponent,
  id,
  causesSideEffects,
  tags,
  injectionToken,
}) => {
  const disByInjectedComponent = new Map();

  const normalInjectable = getInjectable({
    id,
    injectionToken,
    causesSideEffects,
    tags,

    instantiate: di => {
      // Clone component by wrapping it in HOC to create a di-specific reference for it.
      const clonedComponent = forwardRef((props, ref) => (
        <Component {...props} ref={ref} />
      ));

      disByInjectedComponent.set(clonedComponent, di);

      return clonedComponent;
    },
  });

  const InjectableComponent = Object.assign(
    forwardRef((props, ref) => {
      const { di: failSafeDi } = useContext(diContext);
      const InjectedComponent = useInject(InjectableComponent);

      const diForComponentContext =
        disByInjectedComponent.get(InjectedComponent);

      return (
        <DiContextProvider value={{ di: diForComponentContext || failSafeDi }}>
          {PlaceholderComponent ? (
            <Suspense fallback={<PlaceholderComponent />}>
              <InjectedComponent {...props} ref={ref} />
            </Suspense>
          ) : (
            <InjectedComponent {...props} ref={ref} />
          )}
        </DiContextProvider>
      );
    }),

    normalInjectable,

    { displayName: `InjectableComponent(${id})` },
  );

  return InjectableComponent;
};
