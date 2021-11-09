import flow from '../flow/flow';

export default (firstArgument, ...args) => flow(...args)(firstArgument);
