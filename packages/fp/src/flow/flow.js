import { flow, flowRight, identity, isArray, some } from 'lodash/fp';
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

const toTentativeAsyncWrapper = toBeDecorated =>
  flowRight(withTentativeAwait, withSkippingForPipelineBreakFor)(toBeDecorated);
