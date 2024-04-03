export const getRelatedTokens = token =>
  token === undefined
    ? []
    : [token, ...getRelatedTokens(token.specificTokenOf)];
