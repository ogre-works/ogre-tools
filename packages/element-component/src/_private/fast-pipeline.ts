import { fastFlow } from './fast-flow';

export const fastPipeline = (x: any, ...functions: any[]) =>
  fastFlow(...functions)(x);
