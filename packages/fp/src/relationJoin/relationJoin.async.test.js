import relationJoin from './relationJoin';

describe('relationJoin - async', () => {
  it('given a population of any constraint is async, works as async', async () => {
    const level1Items = [{ id: 'some-level-1-id' }];

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const actual = await relationJoin(
      {
        name: 'level1',
        populate: () => Promise.resolve(level1Items),
      },
      {
        name: 'level2',
        populate: () => Promise.resolve(level2Items),
      },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id' },
        level2: { id: 'some-level-2-id' },
      },

      {
        level1: { id: 'some-level-1-id' },
        level2: { id: 'some-other-level-2-id' },
      },
    ]);
  });
});
