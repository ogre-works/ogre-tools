// Note: this function exists only for typed presence in TypeScript.
// It has little purpose in JavaScript.
export const injectionTokenSymbol = Symbol('injection-token');

export default ({ id, decorable = true }) => ({
  id,
  aliasType: injectionTokenSymbol,
  decorable,
});
