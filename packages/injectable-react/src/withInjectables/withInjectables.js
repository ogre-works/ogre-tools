import React from 'react';
import constant from 'lodash/fp/constant';
import { Observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { isPromise } from '@ogre-tools/fp';

const { Provider: DiContextProvider, Consumer: DiContextConsumer } =
  React.createContext();

export { DiContextProvider };

export default (Component, { getPlaceholder = constant(null), getProps }) =>
  props =>
    (
      <DiContextConsumer>
        {({ di }) => {
          const maybeAsyncProps = getProps(di, props);

          if (!isPromise(maybeAsyncProps)) {
            return <Component {...maybeAsyncProps} />;
          }

          const observablePropsPromise = getObservablePromise(maybeAsyncProps);

          return (
            <Observer>
              {() => {
                const syncProps = observablePropsPromise.value;

                if (!syncProps) {
                  return getPlaceholder();
                }

                return <Component {...syncProps} />;
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
