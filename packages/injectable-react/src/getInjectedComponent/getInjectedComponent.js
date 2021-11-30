import React from 'react';
import Inject from '../Inject/Inject';

export default (injectableKey, { getPlaceholder } = {}) =>
  props =>
    (
      <Inject
        injectableKey={injectableKey}
        getPlaceholder={getPlaceholder}
        {...props}
      />
    );
