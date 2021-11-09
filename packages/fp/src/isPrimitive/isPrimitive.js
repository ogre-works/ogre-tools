import isArray from 'lodash/fp/isArray';
import isPlainObject from 'lodash/fp/isPlainObject';
import negate from 'lodash/fp/negate';
import overSome from 'lodash/fp/overSome';
import isPromise from '../isPromise/isPromise';

export default negate(overSome([isPlainObject, isArray, isPromise]));
