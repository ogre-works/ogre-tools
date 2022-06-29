import flow from 'lodash/fp/flow';
import flowRight from 'lodash/fp/flowRight';
import identity from 'lodash/fp/identity';
import isArray from 'lodash/fp/isArray';
import some from 'lodash/fp/some';
import awaitAll from '../awaitAll/awaitAll';
import isPromise from '../isPromise/isPromise';

export const pipelineBreak = Symbol('pipelineBreak');

export default (...functions) =>
  flow([identity, ...functions].map(toTentativeAsyncWrapper));

const isAsync = x => x && !!x.then;

const withTentativeAwait = f => arg =>
  isAsync(arg) ? Promise.resolve(arg).then(f) : f(arg);

const withSkippingForPipelineBreakFor = f => arg => {
  if (arg === pipelineBreak) {
    return pipelineBreak;
  }

  return f(arg);
};

const withTentativeAwaitAll = toBeDecorated => arg => {
  const result = toBeDecorated(arg);

  return isArray(result) && some(isPromise, result) ? awaitAll(result) : result;
};

const toTentativeAsyncWrapper = toBeDecorated =>
  flowRight(
    withTentativeAwait,
    withTentativeAwaitAll,
    withSkippingForPipelineBreakFor,
  )(toBeDecorated);
