import { flow as lodashFlow, flowRight, identity } from 'lodash/fp';

export const pipelineBreak = Symbol('pipelineBreak');

const flowFor =
  breakToken =>
  (...functions) =>
    lodashFlow(
      [identity, ...functions].map(toTentativeAsyncWrapper(breakToken)),
    );

export const flow = flowFor(pipelineBreak);
export const safeFlow = flowFor(undefined);

const isAsync = x => x && !!x.then;

const withTentativeAwait = f => arg =>
  isAsync(arg) ? Promise.resolve(arg).then(f) : f(arg);

const withSkippingForPipelineBreakFor = breakToken => f => arg => {
  if (arg === breakToken) {
    return breakToken;
  }

  return f(arg);
};

const toTentativeAsyncWrapper = breakToken => toBeDecorated =>
  flowRight(
    withTentativeAwait,
    withSkippingForPipelineBreakFor(breakToken),
  )(toBeDecorated);
