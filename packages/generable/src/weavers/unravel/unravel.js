import over from 'lodash/fp/over';

import asStream from '../../publishers/asStream/asStream';
import { pipeline } from '@ogre-tools/fp';

export default (...outputIterables) =>
  inputIterable =>
    pipeline(inputIterable, asStream, over(outputIterables));
