import { flow } from '../../flow/flow';

export const pipeline = (firstArgument, ...args) =>
  flow(...args)(firstArgument);
