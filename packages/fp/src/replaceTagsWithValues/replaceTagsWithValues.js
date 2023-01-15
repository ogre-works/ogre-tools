import {
  get,
  identity,
  isArray,
  isObject,
  map,
  reduce,
  tap,
  isString,
  curry,
} from 'lodash/fp';

import matchAll from '../matchAll/matchAll';

const replaceTagsWithValues = curry((valuesForTags, oldStringWithTags) => {
  const newStringWithTags = pipeline(
    matchAll(oldStringWithTags, /{(.*?)}/),
    map(toResolvedValuesForTagsFor(valuesForTags)),
    reduce(replaceTagWithValue, oldStringWithTags),
  );

  if (newStringWithTags === oldStringWithTags) {
    return newStringWithTags;
  }

  return replaceTagsWithValues(valuesForTags, newStringWithTags);
});

export default (
  stringWithTags,
  valuesForTags,
  { throwOnMissingTagValues = true } = {},
) => {
  return pipeline(
    stringWithTags,
    tap(protectAgainstNonStringInput),
    replaceTagsWithValues(valuesForTags),
    throwOnMissingTagValues ? tap(protectAgainstMissingValues) : identity,
  );
};

const replaceTagWithValue = (stringWithTags, { tag, value }) => {
  if (value === undefined) {
    return stringWithTags;
  }

  return stringWithTags.replace(tag, value || '');
};

const protectAgainstNonStringInput = targetString => {
  if (!isString(targetString)) {
    throw new Error('Non-string input encountered.');
  }
};

const protectAgainstMissingValues = targetString => {
  const findAnyTagRegex = new RegExp(/{[^"]*?}/, 'g');

  const tagsWithoutValue = targetString.match(findAnyTagRegex);

  if (tagsWithoutValue) {
    throw new Error(`Missing value for "${tagsWithoutValue.join('", "')}".`);
  }
};

const toResolvedValuesForTagsFor = valuesForTags => ({
  match: tagWithCurlyBoys,
  group: tagWithoutCurlyBoys,
}) => {
  const replacementValue = get(tagWithoutCurlyBoys, valuesForTags);

  return {
    tag: tagWithCurlyBoys,
    value:
      isObject(replacementValue) || isArray(replacementValue)
        ? JSON.stringify(replacementValue)
        : replacementValue,
  };
};
