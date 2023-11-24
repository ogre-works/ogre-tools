export const withParamsAsDataParameter =
  toBeDecorated =>
  (alias, param, ...args) => {
    if (alias.version === 2) {
      return (...args2) => toBeDecorated(alias, param, ...args)(...args2);
    } else {
      return toBeDecorated(alias, ...args)(param);
    }
  };
