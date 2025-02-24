export const withMappedRef =
  (toBeDecorated: any) =>
  ({ $$ref, ...props }: any) => {
    const { ref, ...restProps } = toBeDecorated(props);

    const oldRefs = $$ref || [];
    const newRefs = ref ? [ref] : [];

    return { ...restProps, $$ref: [...newRefs, ...oldRefs] };
  };
