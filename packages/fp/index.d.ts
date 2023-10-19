import { Get } from 'type-fest';

interface GetFrom {
  <TDictionary, TPropertyPath extends string>(
    dictionary: TDictionary,
    propertyPath: TPropertyPath,
  ): Get<TDictionary, TPropertyPath>;

  <TDictionary>(dictionary: TDictionary): <TPropertyPath extends string>(
    propertyPath: TPropertyPath,
  ) => Get<TDictionary, TPropertyPath>;
}

export const getFrom: GetFrom;
export const getSafeFrom: GetFrom;
export { firstMatchValue } from './src/firstMatchValue/firstMatchValue';
export { pipeline, pipelineBreak } from './src/pipeline/pipeline';
export { safePipeline } from './src/safePipeline/safePipeline';
