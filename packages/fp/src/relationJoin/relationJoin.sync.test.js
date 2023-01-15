import relationJoin from './relationJoin';
import { matches } from 'lodash/fp';

describe('relationJoin', () => {
  it('given single level of items, returns itemized items', () => {
    const level1Items = [
      { id: 'some-level-1-id' },
      { id: 'some-other-level-1-id' },
    ];

    const actual = relationJoin({
      name: 'level1',
      populate: () => level1Items,
    });

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id' },
      },
      {
        level1: { id: 'some-other-level-1-id' },
      },
    ]);
  });

  it('given two levels of items and no constraints, returns combinations of all items', () => {
    const level1Items = [
      { id: 'some-level-1-id' },
      { id: 'some-other-level-1-id' },
    ];

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },
      { name: 'level2', populate: () => level2Items },
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
      {
        level1: { id: 'some-other-level-1-id' },
        level2: { id: 'some-level-2-id' },
      },
      {
        level1: { id: 'some-other-level-1-id' },
        level2: { id: 'some-other-level-2-id' },
      },
    ]);
  });

  it('given two levels of items and constraint for single value, returns constrained combinations', () => {
    const level1Items = [
      { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
      { id: 'some-other-level-1-id', foreignKey: 'some-other-level-2-id' },
    ];

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },

      {
        name: 'level2',
        populate: ({ level1 }) =>
          level2Items.find(matches({ id: level1.foreignKey })),
      },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
        level2: { id: 'some-level-2-id' },
      },

      {
        level1: {
          id: 'some-other-level-1-id',
          foreignKey: 'some-other-level-2-id',
        },
        level2: { id: 'some-other-level-2-id' },
      },
    ]);
  });

  it('given two levels of items and constraint for undefined value, rejects combinations with undefined value', () => {
    const level1Items = [
      { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
      { id: 'some-other-level-1-id', foreignKey: 'some-other-level-2-id' },
      {
        id: 'some-irrelevant-id',
        foreignKey: 'some-unknown-level-2-id',
      },
    ];

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },
      {
        name: 'level2',
        populate: ({ level1 }) =>
          level2Items.find(matches({ id: level1.foreignKey })),
      },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
        level2: { id: 'some-level-2-id' },
      },

      {
        level1: {
          id: 'some-other-level-1-id',
          foreignKey: 'some-other-level-2-id',
        },
        level2: { id: 'some-other-level-2-id' },
      },
    ]);
  });

  it('given outer joined constraint for undefined value, does not reject combinations with undefined value', () => {
    const level1Items = [
      { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
      {
        id: 'some-other-level-1-id',
        foreignKey: 'some-unknown-level-2-id',
      },
    ];

    const level2Items = [{ id: 'some-level-2-id' }];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },
      {
        name: 'level2',
        outerJoined: true,
        populate: ({ level1 }) =>
          level2Items.find(matches({ id: level1.foreignKey })),
      },

      {
        name: 'level3',
        populate: () => ({ id: 'some-level-3-id' }),
      },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },

        level2: { id: 'some-level-2-id' },

        level3: { id: 'some-level-3-id' },
      },

      {
        level1: {
          id: 'some-other-level-1-id',
          foreignKey: 'some-unknown-level-2-id',
        },

        level2: undefined,

        level3: { id: 'some-level-3-id' },
      },
    ]);
  });

  it('given outer joined constraint for empty population, does not reject combinations', () => {
    const level1Items = [
      { id: 'some-level-1-id' },
      {
        id: 'some-other-level-1-id',
      },
    ];

    const level2Items = [];

    const level3Items = [{ id: 'some-level-3-id' }];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },
      {
        name: 'level2',
        outerJoined: true,
        populate: () => level2Items,
      },

      {
        name: 'level3',
        populate: () => level3Items,
      },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id' },

        level2: undefined,

        level3: { id: 'some-level-3-id' },
      },

      {
        level1: {
          id: 'some-other-level-1-id',
        },

        level2: undefined,

        level3: { id: 'some-level-3-id' },
      },
    ]);
  });

  it('given collapsed constraint for empty population, does not reject combinations', () => {
    const level1Items = [
      { id: 'some-level-1-id' },
      {
        id: 'some-other-level-1-id',
      },
    ];

    const level2Items = [];

    const level3Items = [{ id: 'some-level-3-id' }];

    const actual = relationJoin(
      { name: 'level1Item', populate: () => level1Items },
      {
        name: 'level2Items',
        collapsed: true,
        populate: () => level2Items,
      },

      {
        name: 'level3Item',
        populate: () => level3Items,
      },
    );

    expect(actual).toEqual([
      {
        level1Item: { id: 'some-level-1-id' },

        level2Items: [],

        level3Item: { id: 'some-level-3-id' },
      },

      {
        level1Item: {
          id: 'some-other-level-1-id',
        },

        level2Items: [],

        level3Item: { id: 'some-level-3-id' },
      },
    ]);
  });

  it('given collapsed constraint, populates array instead of normalization', () => {
    const level1Items = [
      { id: 'some-level-1-id' },

      {
        id: 'some-other-level-1-id',
      },
    ];

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const level3Items = [{ id: 'some-level-3-id' }];

    const actual = relationJoin(
      { name: 'level1Item', populate: () => level1Items },

      {
        name: 'level2Items',
        collapsed: true,
        populate: () => level2Items,
      },

      {
        name: 'level3Item',
        populate: () => level3Items,
      },
    );

    expect(actual).toEqual([
      {
        level1Item: { id: 'some-level-1-id' },

        level2Items: [
          { id: 'some-level-2-id' },
          { id: 'some-other-level-2-id' },
        ],

        level3Item: { id: 'some-level-3-id' },
      },

      {
        level1Item: {
          id: 'some-other-level-1-id',
        },

        level2Items: [
          { id: 'some-level-2-id' },
          { id: 'some-other-level-2-id' },
        ],

        level3Item: { id: 'some-level-3-id' },
      },
    ]);
  });

  it('given two levels of items and constraint for multiple values, returns constrained combinations', () => {
    const level1Items = [
      {
        id: 'some-level-1-id',
        level2Specification: 'some-level-2-specification',
      },
      {
        id: 'some-other-level-1-id',
        level2Specification: 'some-level-2-specification',
      },
    ];

    const level2Items = [
      {
        id: 'some-level-2-id',
        level2Specification: 'some-level-2-specification',
      },
      {
        id: 'some-other-level-2-id',
        level2Specification: 'some-level-2-specification',
      },
      {
        id: 'some-irrelevant-level-2-id',
        level2Specification: 'irrelevant',
      },
    ];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },
      {
        name: 'level2',
        populate: ({ level1 }) =>
          level2Items.filter(
            matches({ level2Specification: level1.level2Specification }),
          ),
      },
    );

    expect(actual).toEqual([
      {
        level1: {
          id: 'some-level-1-id',
          level2Specification: 'some-level-2-specification',
        },
        level2: {
          id: 'some-level-2-id',
          level2Specification: 'some-level-2-specification',
        },
      },

      {
        level1: {
          id: 'some-level-1-id',
          level2Specification: 'some-level-2-specification',
        },
        level2: {
          id: 'some-other-level-2-id',
          level2Specification: 'some-level-2-specification',
        },
      },

      {
        level1: {
          id: 'some-other-level-1-id',
          level2Specification: 'some-level-2-specification',
        },
        level2: {
          id: 'some-level-2-id',
          level2Specification: 'some-level-2-specification',
        },
      },

      {
        level1: {
          id: 'some-other-level-1-id',
          level2Specification: 'some-level-2-specification',
        },
        level2: {
          id: 'some-other-level-2-id',
          level2Specification: 'some-level-2-specification',
        },
      },
    ]);
  });

  it('given multiple levels of items and no constraints, returns combinations of all items', () => {
    const level1Items = [
      { id: 'some-level-1-id' },
      { id: 'some-other-level-1-id' },
    ];

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const level3Items = [
      { id: 'some-level-3-id' },
      { id: 'some-other-level-3-id' },
    ];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },

      // eslint-disable-next-line
      { name: 'level2', populate: ({ level1 }) => level2Items },

      // eslint-disable-next-line
      { name: 'level3', populate: ({ level2 }) => level3Items },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id' },
        level2: { id: 'some-level-2-id' },
        level3: { id: 'some-level-3-id' },
      },
      {
        level1: { id: 'some-level-1-id' },
        level2: { id: 'some-level-2-id' },
        level3: { id: 'some-other-level-3-id' },
      },
      {
        level1: { id: 'some-level-1-id' },
        level2: { id: 'some-other-level-2-id' },
        level3: { id: 'some-level-3-id' },
      },
      {
        level1: { id: 'some-level-1-id' },
        level2: { id: 'some-other-level-2-id' },
        level3: { id: 'some-other-level-3-id' },
      },
      {
        level1: { id: 'some-other-level-1-id' },
        level2: { id: 'some-level-2-id' },
        level3: { id: 'some-level-3-id' },
      },
      {
        level1: { id: 'some-other-level-1-id' },
        level2: { id: 'some-level-2-id' },
        level3: { id: 'some-other-level-3-id' },
      },
      {
        level1: { id: 'some-other-level-1-id' },
        level2: { id: 'some-other-level-2-id' },
        level3: { id: 'some-level-3-id' },
      },
      {
        level1: { id: 'some-other-level-1-id' },
        level2: { id: 'some-other-level-2-id' },
        level3: { id: 'some-other-level-3-id' },
      },
    ]);
  });

  it('given multiple levels of items and constraint for undefined value, rejects combinations with undefined value', () => {
    const level1Items = [
      { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
      { id: 'some-other-level-1-id', foreignKey: 'some-other-level-2-id' },
    ];

    const level2Items = [
      { id: 'some-level-2-id', foreignKey: 'some-level-3-id' },
      { id: 'some-other-level-2-id', foreignKey: 'some-level-3-id' },
      {
        id: 'some-irrelevant-id',
        foreignKey: 'some-unknown-level-3-id',
      },
    ];

    const level3Items = [{ id: 'some-level-3-id' }];

    const actual = relationJoin(
      { name: 'level1', populate: () => level1Items },

      {
        name: 'level2',

        populate: ({ level1 }) =>
          level2Items.find(matches({ id: level1.foreignKey })),
      },

      {
        name: 'level3',

        populate: ({ level2 }) =>
          level3Items.find(matches({ id: level2.foreignKey })),
      },
    );

    expect(actual).toEqual([
      {
        level1: { id: 'some-level-1-id', foreignKey: 'some-level-2-id' },
        level2: { id: 'some-level-2-id', foreignKey: 'some-level-3-id' },
        level3: { id: 'some-level-3-id' },
      },
      {
        level1: {
          id: 'some-other-level-1-id',
          foreignKey: 'some-other-level-2-id',
        },

        level2: { id: 'some-other-level-2-id', foreignKey: 'some-level-3-id' },
        level3: { id: 'some-level-3-id' },
      },
    ]);
  });

  it('given single item for initial level, returns combinations of all items', () => {
    const singleLevel1Item = { id: 'some-level-1-id' };

    const level2Items = [
      { id: 'some-level-2-id' },
      { id: 'some-other-level-2-id' },
    ];

    const actual = relationJoin(
      { name: 'level1', populate: () => singleLevel1Item },

      // eslint-disable-next-line
      { name: 'level2', populate: ({ level1 }) => level2Items },
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

  it('constraints have access to more significant members of join they are part in', () => {
    const level1Constraint = {
      name: 'level1',

      populate: jest.fn(() => [
        { id: 'some-level-1-id' },
        { id: 'some-other-level-1-id' },
      ]),
    };

    const level2Constraint = {
      name: 'level2',

      populate: jest.fn(() => [
        { id: 'some-level-2-id' },
        { id: 'some-other-level-2-id' },
      ]),
    };

    const level3Constraint = {
      name: 'level3',

      populate: jest.fn(() => [
        { id: 'some-level-3-id' },
        { id: 'some-other-level-3-id' },
      ]),
    };

    relationJoin(level1Constraint, level2Constraint, level3Constraint);

    const actual = {
      level1Calls: level1Constraint.populate.mock.calls,
      level2Calls: level2Constraint.populate.mock.calls,
      level3Calls: level3Constraint.populate.mock.calls,
    };

    expect(actual).toEqual({
      level1Calls: [[undefined]],

      level2Calls: [
        [{ level1: { id: 'some-level-1-id' } }],
        [{ level1: { id: 'some-other-level-1-id' } }],
      ],

      level3Calls: [
        [
          {
            level1: { id: 'some-level-1-id' },
            level2: { id: 'some-level-2-id' },
          },
        ],
        [
          {
            level1: { id: 'some-level-1-id' },
            level2: { id: 'some-other-level-2-id' },
          },
        ],
        [
          {
            level1: { id: 'some-other-level-1-id' },
            level2: { id: 'some-level-2-id' },
          },
        ],
        [
          {
            level1: { id: 'some-other-level-1-id' },
            level2: { id: 'some-other-level-2-id' },
          },
        ],
      ],
    });
  });
});
