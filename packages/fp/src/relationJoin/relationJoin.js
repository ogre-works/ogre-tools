import {
  flatten,
  castArray,
  map,
  isUndefined,
  isEmpty,
  reject,
  some,
} from 'lodash/fp';
import { pipeline } from '../pipeline/unsafePipeline/pipeline';
import awaitAll from '../awaitAll/awaitAll';

const relationJoin = (currentJoinObjects, constraint, ...constraints) => {
  if (!constraint) {
    return currentJoinObjects;
  }

  return pipeline(
    currentJoinObjects,

    map(currentJoinObject =>
      pipeline(
        currentJoinObject,
        constraint.populate,
        castArray,
        constraint.outerJoined
          ? population => (isEmpty(population) ? [undefined] : population)
          : reject(isUndefined),
        constraint.collapsed
          ? toJoinObjectFor(constraint.name, currentJoinObject)
          : map(toJoinObjectFor(constraint.name, currentJoinObject)),
        castArray,
        nextJoinObjects => relationJoin(nextJoinObjects, ...constraints),
        map(recursedJoinObject => ({
          ...currentJoinObject,
          ...recursedJoinObject,
        })),
      ),
    ),

    things => (some(isAsync, things) ? awaitAll(things) : things),

    flatten,
  );
};

const toJoinObjectFor = (name, joinObject) => item => ({
  ...joinObject,
  [name]: item,
});

const isAsync = value => !!value && value.constructor === Promise;

export default (...constraints) => relationJoin([undefined], ...constraints);
