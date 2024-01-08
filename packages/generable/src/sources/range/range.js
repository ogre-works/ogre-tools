import add from 'lodash/fp/add';
import infinity from '../infinity/infinity';
import take from '../../slackers/take/take';
import { pipeline } from '@lensapp/fp';

const file = (
  start = 0,
  increment = 1,
  numberOfTakes = Number.POSITIVE_INFINITY,
) => pipeline(infinity(start, add(increment)), take(numberOfTakes));

file[Symbol.iterator] = file;

export default file;
