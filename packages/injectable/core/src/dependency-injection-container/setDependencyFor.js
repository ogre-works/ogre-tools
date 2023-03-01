export const setDependencyFor =
  ({ dependersMap }) =>
  ({ dependency, depender }) => {
    if (!dependersMap.has(dependency)) {
      dependersMap.set(dependency, new Set());
    }

    dependersMap.get(dependency).add(depender);
  };
