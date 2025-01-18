import { pipeline } from '@lensapp/fp';
import { toPairs, reject, fromPairs } from 'lodash/fp';

export const rejectKeys = (predicate: any) => (input: any) =>
  pipeline(
    input,
    toPairs,
    reject(x => predicate(x[0])),
    fromPairs,
  );
