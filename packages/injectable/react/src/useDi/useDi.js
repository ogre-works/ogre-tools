import { useContext } from 'react';
import { diContext } from '../withInjectables/withInjectables';

export const useDi = () => useContext(diContext);
