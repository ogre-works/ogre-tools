const cycleFunctionsFor = dependeesByDependencyMap => {
  const getOrVerifyCycle = (
    reference,
    path,
    rootReference = reference,
    visited = new Set(),
  ) => {
    if (rootReference.cannotCauseCycles) {
      return;
    }

    if (visited.has(reference)) {
      return;
    }

    visited.add(reference);

    const dependees = dependeesByDependencyMap.get(reference);

    // Todo: this should never be possible?
    if (!dependees) {
      return;
    }

    if (dependees.size === 0) {
      return;
    }

    if (dependees.has(rootReference)) {
      return path ? [rootReference, ...path] : true;
    }

    for (const dependee of dependees) {
      const cycle = getOrVerifyCycle(
        dependee,
        path ? [dependee, ...path] : undefined,
        rootReference,
        visited,
      );

      if (cycle) {
        return cycle;
      }
    }
  };

  return {
    hasCycle: alias => getOrVerifyCycle(alias),
    getCycle: alias => getOrVerifyCycle(alias, [alias]),
  };
};

export const checkForCyclesFor = ({
  dependeesByDependencyMap,
  getNamespacedId,
}) => {
  const { getCycle, hasCycle } = cycleFunctionsFor(dependeesByDependencyMap);

  return alias => {
    if (!hasCycle(alias)) {
      return;
    }

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
