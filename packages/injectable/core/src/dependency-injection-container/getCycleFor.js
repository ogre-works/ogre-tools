export const getCycleFor = dependencyMap => {
  const visited = new Set();

  const getCycle = (
    reference,
    rootReference = reference,
    path = [reference],
  ) => {
    if (visited.has(reference)) {
      return;
    }

    visited.add(reference);

    if (rootReference.cannotCauseCycles) {
      return;
    }

    const dependers = dependencyMap.get(reference);

    // Todo: this should never be possible?
    if (!dependers) {
      return;
    }

    if (dependers.size === 0) {
      return;
    }

    if (dependers.has(rootReference)) {
      return [rootReference, ...path];
    }

    for (const depender of dependers) {
      const cycle = getCycle(depender, rootReference, [depender, ...path]);

      if (cycle) {
        return cycle;
      }
    }
  };

  return reference => getCycle(reference);
};
