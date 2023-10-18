import {
  curry,
  flow,
  fromPairs,
  isArray,
  isUndefined,
  map,
  nth,
  reject,
  some,
  toPairs,
} from 'lodash/fp';
import isPrimitive from '../isPrimitive/isPrimitive';
import { pipeline } from '../pipeline/pipeline';
import isPromise from '../isPromise/isPromise';
import awaitAll from '../awaitAll/awaitAll';

const mapEntries = how => thing =>
  pipeline(
    thing,
    toPairs,
    map(how),
    stickyAwaitAll,
    reject(valueIsUndefined),
    isArray(thing) ? map(nth(1)) : fromPairs,
  );

export default curry((how, thing) =>
  recursiveMapValuesDeep({
    how,
    thing: how(thing, [], thing),
    rootThing: thing,
    referencePath: [],
  }),
);

const recursiveMapValuesDeep = ({
  how,
  thing,
  rootThing,
  referencePath,
  nonCyclicThings = new Set(),
}) =>
  pipeline(
    thing,
    mapEntries(toEntriesFor(how, referencePath, rootThing, nonCyclicThings)),
  );

const getNewReferencePath = (key, oldReferencePath) => [
  ...oldReferencePath,
  key,
];

const toEntriesFor =
  (how, oldReferencePath, rootThing, nonCyclicThings) =>
  ([key, value]) => {
    const newReferencePath = getNewReferencePath(key, oldReferencePath);

    const maybeAsyncNewThing = how(value, newReferencePath, rootThing);

    if (nonCyclicThings.has(maybeAsyncNewThing)) {
      throw new Error(
        `Cycle encountered when mapping path: "${newReferencePath.join('.')}"`,
      );
    }

    const newNonCyclicThings = new Set([
      ...nonCyclicThings.values(),
      maybeAsyncNewThing,
    ]);

    return pipeline(maybeAsyncNewThing, syncNewThing => [
      key,

      isPrimitive(syncNewThing)
        ? syncNewThing
        : recursiveMapValuesDeep({
            how,
            referencePath: newReferencePath,
            thing: syncNewThing,
            rootThing,
            nonCyclicThings: newNonCyclicThings,
          }),
    ]);
  };

const valueIsUndefined = flow(nth(1), isUndefined);

const stickyAwaitAll = result =>
  isArray(result) && some(isPromise, result) ? awaitAll(result) : result;
