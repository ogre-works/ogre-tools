import React, { forwardRef, Suspense } from 'react';

import { getInjectable2 } from '@lensapp/injectable';
import { useInject } from '../useInject/useInject';

export const getInjectableComponent2 = ({
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
  getInjectable2({
    id,
    injectionToken,
    causesSideEffects,
    tags,

    instantiate: () => () =>
      forwardRef((props, ref) =>
        PlaceholderComponent ? (
          <Suspense fallback={<PlaceholderComponent {...props} />}>
            <Component {...props} ref={ref} />
          </Suspense>
        ) : (
          <Component {...props} ref={ref} />
        ),
      ),
  });
