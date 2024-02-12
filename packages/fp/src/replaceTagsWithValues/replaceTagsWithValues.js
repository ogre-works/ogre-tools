import { get, isArray, isObject, isString, map, reduce, tap } from 'lodash/fp';

import matchAll from '../matchAll/matchAll';
import { pipeline } from '../pipeline/unsafePipeline/pipeline';

const replaceTagsWithValuesInternal = valuesForTags => oldStringWithTags => {
  const newStringWithTags = pipeline(
    matchAll(oldStringWithTags, /{(.*?)}/),
    map(toResolvedValuesForTagsFor(valuesForTags)),
    reduce(replaceTagWithValue, oldStringWithTags),
  );

  if (newStringWithTags === oldStringWithTags) {
    return newStringWithTags;
  }

  return replaceTagsWithValuesInternal(valuesForTags)(newStringWithTags);
};

export const replaceTagsWithValues = stringWithTags => valuesForTags =>
  pipeline(
    stringWithTags,
    tap(protectAgainstNonStringInput),
    replaceTagsWithValuesInternal(valuesForTags),
    tap(protectAgainstMissingValues),
  );

export const replaceTagsWithValuesUnsafe = stringWithTags => valuesForTags =>
  pipeline(
    stringWithTags,
    tap(protectAgainstNonStringInput),
    replaceTagsWithValuesInternal(valuesForTags),
  );

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

const toResolvedValuesForTagsFor =
  valuesForTags =>
  ({ match: tagWithCurlyBoys, group: tagWithoutCurlyBoys }) => {
    const replacementValue = get(tagWithoutCurlyBoys, valuesForTags);

    return {
      tag: tagWithCurlyBoys,
      value:
        isObject(replacementValue) || isArray(replacementValue)
          ? JSON.stringify(replacementValue)
          : replacementValue,
    };
  };
