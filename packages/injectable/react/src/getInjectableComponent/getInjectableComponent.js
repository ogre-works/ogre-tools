import React, { forwardRef, Suspense, useContext, useMemo } from 'react';

import { getInjectable, lifecycleEnum } from '@lensapp/injectable';
import { useInjectDeferred } from '../useInject/useInject';
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
  const normalInjectable = getInjectable({
    id,
    injectionToken,
    causesSideEffects,
    tags,
    instantiate: () => Component,
  });

  const InjectableComponent = Object.assign(
    forwardRef((props, ref) => {
      const failSafeDi = useContext(diContext);
      const InjectedComponent = useInjectDeferred(InjectableComponent);

      return (
        <DiContextProvider value={failSafeDi}>
          {PlaceholderComponent ? (
            <Suspense fallback={<PlaceholderComponent {...props} />}>
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
