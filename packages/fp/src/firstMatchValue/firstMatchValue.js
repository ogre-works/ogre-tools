export const firstMatchValue =
  (...functions) =>
  data => {
    for (const f of functions) {
      const value = f(data);

      if (value !== undefined) {
        return value;
      }
    }
  };
