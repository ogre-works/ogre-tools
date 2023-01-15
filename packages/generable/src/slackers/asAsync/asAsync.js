export default async function*(iterable) {
  for await (const i of iterable) {
    yield i;
  }
}
