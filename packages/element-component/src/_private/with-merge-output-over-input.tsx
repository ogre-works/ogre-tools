export const withMergeOutputOverInput =
  (toBeDecorated: any) => (input: any) => {
    const output = toBeDecorated(input);

    const outputOverInput = { ...input, ...output };

    Object.entries(outputOverInput).forEach(([key, value]) => {
      if (value === undefined) {
        delete outputOverInput[key];
      }
    });

    return outputOverInput;
  };
