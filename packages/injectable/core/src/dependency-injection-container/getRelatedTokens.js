// Token hierarchies (specificTokenOf chains) are immutable — cache per token.
const tokenChainCache = new WeakMap();

export const getRelatedTokens = token => {
  if (token === undefined) {
    return emptyArray;
  }

  let cached = tokenChainCache.get(token);

  if (cached) {
    return cached;
  }

  const tokens = [];
  let current = token;

  while (current !== undefined) {
    tokens.push(current);
    current = current.specificTokenOf;
  }

  tokenChainCache.set(token, tokens);

  return tokens;
};

export const isRelatedToToken = (token, ancestor) => {
  let current = token;

  while (current) {
    if (current === ancestor) return true;
    current = current.specificTokenOf;
  }

  return false;
};

const emptyArray = [];
