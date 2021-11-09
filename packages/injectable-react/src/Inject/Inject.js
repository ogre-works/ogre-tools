import { action, observable } from 'mobx';
import { Observer } from 'mobx-react';
import React from 'react';
import constant from 'lodash/fp/constant';
import isFunction from 'lodash/fp/isFunction';

import { isPromise } from '@ogre-tools/fp';

const {
  Provider: DiContextProvider,
  Consumer: DiContextConsumer,
} = React.createContext();

export { DiContextProvider };

export default ({
  Component,
  injectableKey = Component,
  instantiationParameter,
  getPlaceholder = constant(null),
  ...props
}) => (
  <DiContextConsumer>
    {({ di }) => {
      const MaybeAsyncComponent = di.inject(
        injectableKey,
        instantiationParameter,

        (instantiate) => (dependencies, instantiationParameter) => {
          const componentWithoutDependencies = dependencies === di;

          if (componentWithoutDependencies) {
            return instantiate(di, instantiationParameter);
          }

          return (props) => {
            const ComponentJsxOrFunctionComponent = instantiate({
              ...dependencies,
              ...props,
              ...instantiationParameter,
            });

            return isFunction(ComponentJsxOrFunctionComponent)
              ? ComponentJsxOrFunctionComponent(props)
              : ComponentJsxOrFunctionComponent;
          };
        },
      );

      if (!isPromise(MaybeAsyncComponent)) {
        return <MaybeAsyncComponent {...props} />;
      }

      const observablePromise = getObservablePromise(MaybeAsyncComponent);

      return (
        <Observer>
          {() => {
            const SyncComponent = observablePromise.value;

            if (!SyncComponent) {
              return getPlaceholder();
            }

            return <SyncComponent {...props} />;
          }}
        </Observer>
      );
    }}
  </DiContextConsumer>
);

const getObservablePromise = (asyncValue) => {
  const observableObject = observable({ value: null }, null, {
    deep: false,
  });

  asyncValue.then(
    action((syncValue) => {
      observableObject.value = syncValue;
    }),
  );

  return observableObject;
};
