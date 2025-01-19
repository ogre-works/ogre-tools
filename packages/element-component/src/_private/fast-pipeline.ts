import { fastFlow } from './fast-flow';

export const fastPipeline = (x, ...functions: any[]) =>
  fastFlow(...functions)(x);
