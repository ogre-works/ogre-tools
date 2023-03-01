const getCycleFor = dependeesMap => {
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

    const dependees = dependeesMap.get(reference);

    // Todo: this should never be possible?
    if (!dependees) {
      return;
    }

    if (dependees.size === 0) {
      return;
    }

    if (dependees.has(rootReference)) {
      return [rootReference, ...path];
    }

    for (const dependee of dependees) {
      const cycle = getCycle(
        dependee,
        rootReference,
        [dependee, ...path],
        visited,
      );

      if (cycle) {
        return cycle;
      }
    }
  };

  return reference => getCycle(reference);
};

export const checkForCyclesFor = ({ dependeesMap, getNamespacedId }) => {
  const getCycle = getCycleFor(dependeesMap);

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
