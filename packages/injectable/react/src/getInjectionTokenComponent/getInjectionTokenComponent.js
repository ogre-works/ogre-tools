import React, { forwardRef, Suspense, useContext } from 'react';
import { getInjectionToken } from '@lensapp/injectable';
import { useInject } from '../useInject/useInject';
import {
  diContext,
  DiContextProvider,
} from '../withInjectables/withInjectables';

export const getInjectionTokenComponent = ({
  PlaceholderComponent,
  id,
  decorable,
  specificInjectionTokenFactory,
  speciality,
}) => {
  let TokenComponent;

  const ComponentForReact = forwardRef((props, ref) => {
    const InjectedComponent = useInject(TokenComponent);
    const di = useContext(diContext);

    return (
      <DiContextProvider value={di}>
        {PlaceholderComponent ? (
          <Suspense fallback={<PlaceholderComponent {...props} />}>
            <InjectedComponent {...props} ref={ref} />
          </Suspense>
        ) : (
          <InjectedComponent {...props} ref={ref} />
        )}
      </DiContextProvider>
    );
  });

  TokenComponent = getInjectionToken({
    id,
    decorable,
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
