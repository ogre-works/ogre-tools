import createContainer from '../dependency-injection-container/createContainer';
import { pipeline } from '@ogre-tools/fp';
import map from 'lodash/fp/map';
import fromPairs from 'lodash/fp/fromPairs';
import keys from 'lodash/fp/keys';

const nonCappedMap = map.convert({ cap: false });

export default (...injectables) => {
  const requireContextStub = getRequireContextStub(...injectables);

  return createContainer(requireContextStub);
};

const getRequireContextStub = (...injectables) => {
  const contextDictionary = pipeline(
    injectables,
    map(injectable => ({ default: injectable })),
    nonCappedMap((file, index) => [
      `stubbed-require-context-key-${index}`,
      file,
    ]),
    fromPairs,
  );

  const contextStub = contextKey => contextDictionary[contextKey];

  contextStub.keys = () => keys(contextDictionary);

  return () => contextStub;
};
