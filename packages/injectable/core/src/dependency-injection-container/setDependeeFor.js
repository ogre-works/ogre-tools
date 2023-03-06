export const setDependeeFor =
  ({ dependeesByDependencyMap, dependenciesByDependencyMap }) =>
  ({ dependency, dependee }) => {
    if (!dependeesByDependencyMap.has(dependency)) {
      dependeesByDependencyMap.set(dependency, new Set());
    }

    dependeesByDependencyMap.get(dependency).add(dependee);

    if (!dependenciesByDependencyMap.has(dependee)) {
      dependenciesByDependencyMap.set(dependee, new Set());
    }

    dependenciesByDependencyMap.get(dependee).add(dependency);
  };
