export default iterable =>
  Symbol.asyncIterator in iterable
    ? iterable[Symbol.asyncIterator]()
    : iterable[Symbol.iterator]();
