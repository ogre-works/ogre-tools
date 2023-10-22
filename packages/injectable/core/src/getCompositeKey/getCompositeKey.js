export const compositeKeySymbol = Symbol('composite-key');
export const getCompositeKey = (...keys) => ({
  [compositeKeySymbol]: true,
  keys,
});

export const isCompositeKey = thing =>
  thing && thing[compositeKeySymbol] === true;
