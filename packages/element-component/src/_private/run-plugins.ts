// Optimized plugin runner that minimizes allocations
// Instead of wrapping each plugin, we inline the logic

export const runPlugins = (
  initialProps: any,
  plugins: any[],
): { props: any; refs: any[] } => {
  let currentProps = initialProps;
  const collectedRefs: any[] = [];

  for (let i = 0; i < plugins.length; i++) {
    const output = plugins[i](currentProps);

    // Handle ref collection
    const ref = output.ref;
    if (ref !== undefined) {
      if (ref !== null) {
        collectedRefs.push(ref);
      }
      output.ref = undefined;
    }

    // Merge input props into output (output takes precedence)
    for (const key in currentProps) {
      if (!(key in output)) {
        output[key] = currentProps[key];
      }
    }

    // Remove undefined values (plugins set props to undefined to clean them up)
    for (const key in output) {
      if (output[key] === undefined) {
        delete output[key];
      }
    }

    currentProps = output;
  }

  return { props: currentProps, refs: collectedRefs };
};
