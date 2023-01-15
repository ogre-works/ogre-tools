import delay from '../../../doings/delay/delay';
import pipeline from '../../../doings/pipeline/pipeline';
import asArray from '../../pullers/asArray/asArray';
import asAsync from '../../slackers/asAsync/asAsync';
import serialize from './serialize';

describe('serialize', () => {
  it('given multiple sync iterables, when iterated, synchronously iterates one value from each iterable in a serie', () => {
    const syncIterable1 = [1, 2, 3];
    const syncIterable2 = [4];
    const syncIterable3 = [7, 8];

    const result = pipeline(
      serialize(syncIterable1, syncIterable2, syncIterable3),
      asArray,
    );

    expect(result).toEqual([1, 4, 7, 2, 8, 3]);
  });

  it('given multiple iterables containing at least one async, when iterated, asynchronously iterates one value from each iterable in a serie', async () => {
    const syncIterable1 = [1, 2, 3];
    const asyncIterable2 = asAsync([4]);
    const syncIterable3 = [7, 8];

    const result = await pipeline(
      serialize(syncIterable1, asyncIterable2, syncIterable3),
      asArray,
    );

    expect(result).toEqual([1, 4, 7, 2, 8, 3]);
  });

  it('given multiple iterables containing at least one slow async, when iterated, the slow one does not block the fast ones', async () => {
    const syncIterable1 = [1, 2, 3];

    const asyncIterable2 = (async function*() {
      yield await delay(1, 'slow-value');
    })();

    const syncIterable3 = [7, 8];

    const result = await pipeline(
      serialize(syncIterable1, asyncIterable2, syncIterable3),
      asArray,
    );

    expect(result).toEqual([1, 7, 2, 8, 3, 'slow-value']);
  });
});
