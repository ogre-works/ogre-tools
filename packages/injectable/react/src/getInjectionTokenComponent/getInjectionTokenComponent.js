import React, { forwardRef, Suspense } from 'react';
import { getInjectionToken } from '@ogre-tools/injectable';
import { useInject } from '../useInject/useInject';

export const getInjectionTokenComponent = ({
  PlaceholderComponent,
  id,
  specificInjectionTokenFactory,
  speciality,
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

  TokenComponent = getInjectionToken({
    id,
    target: ComponentForReact,
    speciality,

    specificInjectionTokenFactory:
      specificInjectionTokenFactory ??
      (specId =>
        getInjectionTokenComponent({
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
