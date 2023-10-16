export function firstMatchValue<TInput, TOutput>(
  ...functions: ((input: TInput) => TOutput | undefined)[]
): (input: TInput) => TOutput | undefined;
