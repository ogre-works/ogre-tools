import curry from 'lodash/fp/curry';

export default curry(
  (delayMilliseconds, returnValue) =>
    new Promise(resolve => {
      setTimeout(() => resolve(returnValue), delayMilliseconds);
    }),
);
