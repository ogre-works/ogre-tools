import over from 'lodash/fp/over';

import pipeline from '../../../doings/pipeline/pipeline';
import asStream from '../../publishers/asStream/asStream';

export default (...outputIterables) => inputIterable =>
  pipeline(inputIterable, asStream, over(outputIterables));
