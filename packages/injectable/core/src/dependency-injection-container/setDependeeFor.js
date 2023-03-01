export const setDependeeFor =
  ({ dependeesByDependencyMap }) =>
  ({ dependency, dependee }) => {
    if (!dependeesByDependencyMap.has(dependency)) {
      dependeesByDependencyMap.set(dependency, new Set());
    }

    dependeesByDependencyMap.get(dependency).add(dependee);
  };
