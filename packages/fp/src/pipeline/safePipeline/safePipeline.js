import { safeFlow } from '../../flow/flow';

export const safePipeline = (firstArgument, ...args) =>
  safeFlow(...args)(firstArgument);
