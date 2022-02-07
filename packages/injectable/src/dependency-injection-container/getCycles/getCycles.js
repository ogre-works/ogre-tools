import map from 'lodash/fp/map';
import reject from 'lodash/fp/reject';
import isEmpty from 'lodash/fp/isEmpty';
import includes from 'lodash/fp/includes';
import flatMap from 'lodash/fp/flatMap';
import { pipeline } from '@ogre-tools/fp';

export default oneToManyMap => {
  const getCycles = (parentNode, context) => {
    if (parentNode === undefined) {
      return pipeline(
        [...oneToManyMap.keys()],
        map(rootNode => getCycles(rootNode, [])),
        reject(isEmpty),
      );
    }

    if (pipeline(context, includes(parentNode))) {
      return [...context, parentNode];
    }

    const children = [...oneToManyMap.get(parentNode).values()];

    return pipeline(
      children,
      flatMap(childNode => getCycles(childNode, [...context, parentNode])),
    );
  };

  return getCycles();
};
