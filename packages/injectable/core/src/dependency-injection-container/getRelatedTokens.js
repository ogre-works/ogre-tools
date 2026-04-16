export const getRelatedTokens = token => {
  const tokens = [];
  let current = token;

  while (current !== undefined) {
    tokens.push(current);
    current = current.specificTokenOf;
  }

  return tokens;
};
