import React from 'react';
import constant from 'lodash/fp/constant';
import { Observer } from 'mobx-react';
import { action, observable } from 'mobx';

import { isPromise } from '@ogre-tools/fp';
import { pipeline } from '../../../fp/src/index';
import toPairs from 'lodash/fp/toPairs';
import map from 'lodash/fp/map';
import fromPairs from 'lodash/fp/fromPairs';

const { Provider: DiContextProvider, Consumer: DiContextConsumer } =
  React.createContext();

export { DiContextProvider };

export default (
    Component,
    { getPlaceholder = constant(null), getDependencies },
  ) =>
  props =>
    (
      <DiContextConsumer>
        {({ di }) => {
          const maybeAsyncDependencies = pipeline(
            di,
            getDependencies,
            synchronize,
          );

          if (!isPromise(maybeAsyncDependencies)) {
            return <Component {...maybeAsyncDependencies} {...props} />;
          }

          const observableDependencyPromise = getObservablePromise(
            maybeAsyncDependencies,
          );

          return (
            <Observer>
              {() => {
                const dependencies = observableDependencyPromise.value;

                if (!dependencies) {
                  return getPlaceholder();
                }

                return <Component {...dependencies} {...props} />;
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

const synchronize = maybeAsyncDependencies =>
  pipeline(
    maybeAsyncDependencies,
    toPairs,

    map(([key, maybeAsyncDependency]) =>
      isPromise(maybeAsyncDependency)
        ? maybeAsyncDependency.then(syncDependency => [key, syncDependency])
        : [key, maybeAsyncDependency],
    ),

    fromPairs,
  );
