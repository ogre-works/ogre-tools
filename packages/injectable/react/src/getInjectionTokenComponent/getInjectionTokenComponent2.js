import React, { forwardRef, Suspense } from 'react';
import { getInjectionToken2 } from '@ogre-tools/injectable';
import { useInject } from '../useInject/useInject';

export const getInjectionTokenComponent2 = ({
  PlaceholderComponent,
  id,
  specificInjectionTokenFactory,
  speciality,
  tags,
}) => {
  let TokenComponent;

  const ComponentForReact = forwardRef((props, ref) => {
    const InjectedComponent = useInject(TokenComponent);

    return PlaceholderComponent ? (
      <Suspense fallback={<PlaceholderComponent {...props} />}>
        <InjectedComponent {...props} ref={ref} />
      </Suspense>
    ) : (
      <InjectedComponent {...props} ref={ref} />
    );
  });

  TokenComponent = getInjectionToken2()({
    id,
    target: ComponentForReact,
    speciality,
    tags,

    // A component token is implemented by exactly one component; its
    // `.for()` children inherit that.
    cardinality: 'one',

    specificInjectionTokenFactory:
      specificInjectionTokenFactory ??
      (specId =>
        getInjectionTokenComponent2({
          id: specId,
          PlaceholderComponent,
          speciality: specId,
        })),
  });

  Object.defineProperty(TokenComponent, 'displayName', {
    get() {
      return `InjectionTokenComponent(${this.id})`;
    },
    configurable: true,
  });

  return TokenComponent;
};
