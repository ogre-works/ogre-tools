import asValue from '../asValue/asValue';
import { pipeline } from '@lensapp/fp';

export default iterable => {
  const subscriptionBuffer = pipeline(iterable, asValue);

  return {
    subscribe: subscriber => subscriber(subscriptionBuffer),
  };
};
