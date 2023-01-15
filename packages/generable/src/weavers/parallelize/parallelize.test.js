import pipeline from '../../../doings/pipeline/pipeline';
import asArray from '../../pullers/asArray/asArray';
import asAsync from '../../slackers/asAsync/asAsync';
import parallelize from './parallelize';

describe('parallelize', () => {
  it('given multiple sync iterables, when iterated, synchronously iterates one value from each iterable', () => {
    const syncIterable1 = [1, 2, 3];
    const syncIterable2 = [4, 5, 6, 'irrelevant'];
    const syncIterable3 = [7, 8, 9, 'irrelevant', 'irrelevant'];

    const result = pipeline(
      parallelize(syncIterable1, syncIterable2, syncIterable3),
      asArray,
    );

    expect(result).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  });

  it('given multiple iterables containing at least one async, when iterated, asynchronously iterates one value from each iterable', async () => {
    const syncIterable1 = [1, 2, 3];
    const asyncIterable2 = asAsync([4, 5, 6, 'irrelevant']);
    const syncIterable3 = [7, 8, 9, 'irrelevant', 'irrelevant'];

    const result = await pipeline(
      parallelize(syncIterable1, asyncIterable2, syncIterable3),
      asArray,
    );

    expect(result).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  });
});
