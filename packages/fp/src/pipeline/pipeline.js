import flow, { pipelineBreak } from '../flow/flow';

export { pipelineBreak };

export const pipeline = (firstArgument, ...args) =>
  flow(...args)(firstArgument);
