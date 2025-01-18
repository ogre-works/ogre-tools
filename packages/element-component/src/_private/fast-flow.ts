export const fastFlow =
  (...functions: any[]) =>
  (x: any) => {
    let val = x;

    functions.forEach(f => {
      val = f(val);
    });

    return val;
  };
