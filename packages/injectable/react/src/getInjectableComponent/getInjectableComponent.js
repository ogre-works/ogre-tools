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
  let diForComponentContext;

  const normalInjectable = getInjectable({
    id,
    injectionToken,
    causesSideEffects,
    tags,

    instantiate: di => {
      diForComponentContext = di;

      return Component;
    },
  });

  const InjectableComponent = Object.assign(
    forwardRef((props, ref) => {
      const { di: failSafeDi } = useContext(diContext);
      const InjectedComponent = useInject(InjectableComponent);

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
