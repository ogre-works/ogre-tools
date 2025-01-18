export const withMergeOutputOverInput =
  (toBeDecorated: any) => (input: any) => {
    const output = toBeDecorated(input);

    return { ...input, ...output };
  };
