export default windowSize => things =>
  things.reduce(
    (accumulated, currentThing, index, allThings) =>
      index > allThings.length - windowSize
        ? accumulated
        : [...accumulated, allThings.slice(index, index + windowSize)],
    [],
  );
