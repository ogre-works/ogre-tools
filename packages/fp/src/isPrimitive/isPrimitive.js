import { isArray, isPlainObject, negate, overSome } from 'lodash/fp';
import isPromise from '../isPromise/isPromise';

export default negate(overSome([isPlainObject, isArray, isPromise]));
