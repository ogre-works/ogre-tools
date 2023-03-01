export const setDependencyFor =
  ({ dependeesMap }) =>
  ({ dependency, dependee }) => {
    if (!dependeesMap.has(dependency)) {
      dependeesMap.set(dependency, new Set());
    }

    dependeesMap.get(dependency).add(dependee);
  };
