export default (...functions) =>
  x => {
    let val = x;

    functions.forEach(f => {
      val = f(val);
    });

    return val;
  };
