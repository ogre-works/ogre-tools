export const setDependeeFor =
  ({ dependeesByDependencyMap, dependenciesByDependencyMap }) =>
  (dependency, dependee) => {
    let dependees = dependeesByDependencyMap.get(dependency);

    if (!dependees) {
      dependees = new Set();
      dependeesByDependencyMap.set(dependency, dependees);
    }

    dependees.add(dependee);

    let dependencies = dependenciesByDependencyMap.get(dependee);

    if (!dependencies) {
      dependencies = new Set();
      dependenciesByDependencyMap.set(dependee, dependencies);
    }

    dependencies.add(dependency);
  };
