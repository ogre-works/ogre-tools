import { useContext, useMemo } from 'react';
import { diContext } from '../withInjectables/withInjectables';

export const useInject2 = alias => {
  const di = useContext(diContext);

  return useMemo(() => di.inject2(alias), [di, alias]);
};
