import { useContext, useMemo } from 'react';
import { diContext } from '../withInjectables/withInjectables';

export const useInject2 = alias => {
  const di = useContext(diContext);

  // `injectFactory`, not `inject2`: the context is given a container for
  // injection, which spells v2 injection that way and has no `inject2` at all.
  // The full container has both, which is why passing one in a test hides this.
  return useMemo(() => di.injectFactory(alias), [di, alias]);
};
