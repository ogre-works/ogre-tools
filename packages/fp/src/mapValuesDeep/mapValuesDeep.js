import curry from 'lodash/fp/curry';
import flow from 'lodash/fp/flow';
import fromPairs from 'lodash/fp/fromPairs';
import isArray from 'lodash/fp/isArray';
import isUndefined from 'lodash/fp/isUndefined';
import map from 'lodash/fp/map';
import nth from 'lodash/fp/nth';
import reject from 'lodash/fp/reject';
import toPairs from 'lodash/fp/toPairs';
import isPrimitive from '../isPrimitive/isPrimitive';
import pipeline from '../pipeline/pipeline';

const mapEntries = how => thing =>
  pipeline(
    thing,
    toPairs,
    map(how),
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
