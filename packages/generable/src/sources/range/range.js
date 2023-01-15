import add from 'lodash/fp/add';
import pipeline from '../../../doings/pipeline/pipeline';
import infinity from '../infinity/infinity';
import take from '../../slackers/take/take';

const file = (
  start = 0,
  increment = 1,
  numberOfTakes = Number.POSITIVE_INFINITY,
) => pipeline(infinity(start, add(increment)), take(numberOfTakes));

file[Symbol.iterator] = file;

export default file;
