const getCycleFor = dependersMap => {
  const getCycle = (
    reference,
    rootReference = reference,
    path = [reference],
    visited = new Set(),
  ) => {
    if (rootReference.cannotCauseCycles) {
      return;
    }

    if (visited.has(reference)) {
      return;
    }

    visited.add(reference);

    const dependers = dependersMap.get(reference);

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
      const cycle = getCycle(
        depender,
        rootReference,
        [depender, ...path],
        visited,
      );

      if (cycle) {
        return cycle;
      }
    }
  };

  return reference => getCycle(reference);
};

export const checkForCyclesFor = ({ dependersMap, getNamespacedId }) => {
  const getCycle = getCycleFor(dependersMap);

  return alias => {
    const cycle = getCycle(alias);

    if (cycle) {
      throw new Error(
        `Cycle of injectables encountered: "${cycle
          .map(getNamespacedId)
          .join('" -> "')}"`,
      );
    }
  };
};
