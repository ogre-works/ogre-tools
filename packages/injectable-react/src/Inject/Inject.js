import { action, observable } from 'mobx';
import { Observer } from 'mobx-react';
import React from 'react';
import constant from 'lodash/fp/constant';

import { isPromise } from '@ogre-tools/fp';

const { Provider: DiContextProvider, Consumer: DiContextConsumer } =
  React.createContext();

export { DiContextProvider };

export default ({
  Component,
  injectableKey = Component,
  getPlaceholder = constant(null),
  ...props
}) => (
  <DiContextConsumer>
    {({ di }) => {
      const maybeAsyncJsx = di.inject(injectableKey, props);

      if (!isPromise(maybeAsyncJsx)) {
        return maybeAsyncJsx;
      }

      const observablePromise = getObservablePromise(maybeAsyncJsx);

      return (
        <Observer>
          {() => {
            const syncJsx = observablePromise.value;

            if (!syncJsx) {
              return getPlaceholder();
            }

            return syncJsx;
          }}
        </Observer>
      );
    }}
  </DiContextConsumer>
);

const getObservablePromise = asyncValue => {
  const observableObject = observable({ value: null }, null, {
    deep: false,
  });

  asyncValue.then(
    action(syncValue => {
      observableObject.value = syncValue;
    }),
  );

  return observableObject;
};
