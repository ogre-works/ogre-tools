import pipeline from '../../../doings/pipeline/pipeline';
import asValue from '../asValue/asValue';

export default iterable => {
  const subscriptionBuffer = pipeline(iterable, asValue);

  return {
    subscribe: subscriber => subscriber(subscriptionBuffer),
  };
};
