import { expectType } from 'tsd';
import { firstMatchValue as firstMatchValueFor } from './firstMatchValue';

const firstMatchValue = firstMatchValueFor(
  x => 'some-string',
  x => 'some-other-string',
);

const actual = firstMatchValue(true);

expectType<string | undefined>(actual);
