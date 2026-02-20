import React, { forwardRef, Suspense, useContext } from 'react';

import { getInjectable } from '@ogre-tools/injectable';
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
  const componentForInjectable = getComponentAsInjectableAndAbleToSuspend(
    Component,
    PlaceholderComponent,
    id,
    causesSideEffects,
    tags,
    injectionToken,
  );

  const ComponentForReact = forwardRef((props, ref) => {
    const InjectedComponent = useInject(InjectableComponent);

    return <InjectedComponent {...props} ref={ref} />;
  });

  const InjectableComponent = Object.assign(
    ComponentForReact,
    componentForInjectable,
    { displayName: `InjectableComponent(${id})` },
  );

  return InjectableComponent;
};

const getComponentAsInjectableAndAbleToSuspend = (
  Component,
  PlaceholderComponent,
  id,
  causesSideEffects,
  tags,
  injectionToken,
) =>
  getInjectable({
    id,
    injectionToken,
    causesSideEffects,
    tags,

    instantiate: () =>
      forwardRef((props, ref) => {
        const di = useContext(diContext);

        return (
          <DiContextProvider value={di}>
            {PlaceholderComponent ? (
              <Suspense fallback={<PlaceholderComponent {...props} />}>
                <Component {...props} ref={ref} />
              </Suspense>
            ) : (
              <Component {...props} ref={ref} />
            )}
          </DiContextProvider>
        );
      }),
  });
