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
export {
  pipeline,
  pipelineBreak,
} from './src/pipeline/unsafePipeline/pipeline';
export { safePipeline } from './src/pipeline/safePipeline/safePipeline';

export {
  replaceTagsWithValues,
  replaceTagsWithValuesUnsafe,
} from './src/replaceTagsWithValues/replaceTagsWithValues';
