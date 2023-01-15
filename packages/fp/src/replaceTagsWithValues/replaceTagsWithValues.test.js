import replaceTagsWithValues from './replaceTagsWithValues';

describe('replaceTagsWithValues', () => {
  it('replaces one tag in string', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTag}" some more string',
      { someTag: 'some tag value' },
    );

    expect(actual).toBe('some string "some tag value" some more string');
  });

  it('replaces multiple tags in string', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTag}" some more string "{someTag}" again',
      { someTag: 'some tag value' },
    );

    expect(actual).toBe(
      'some string "some tag value" some more string "some tag value" again',
    );
  });

  it('replaces multiple different tags in string', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTag}" some more string "{someOtherTag}"',
      { someTag: 'some tag value', someOtherTag: 'some other tag value' },
    );

    expect(actual).toBe(
      'some string "some tag value" some more string "some other tag value"',
    );
  });

  it('replaces nested tags in string', () => {
    const actual = replaceTagsWithValues('some string "{some.nested.value}"', {
      some: { nested: { value: 'some nested tag value' } },
    });

    expect(actual).toBe('some string "some nested tag value"');
  });

  it('given tagged value is object, replaces with stringified object', () => {
    const actual = replaceTagsWithValues('some string "{some}"', {
      some: { nested: { value: 'some nested tag value' } },
    });

    expect(actual).toBe(
      'some string "{"nested":{"value":"some nested tag value"}}"',
    );
  });

  it('given tagged value is array, replaces with stringified array', () => {
    const actual = replaceTagsWithValues('some string "{some}"', {
      some: ['array-value', 'other-array-value'],
    });

    expect(actual).toBe('some string "["array-value","other-array-value"]"');
  });

  it('given non-string input, throws', () => {
    expect(() => {
      replaceTagsWithValues({ not: 'string' }, {});
    }).toThrow('Non-string input encountered.');
  });

  it('given not enough values for tags, throws', () => {
    expect(() => {
      replaceTagsWithValues(
        'some string "{someTag}" some more string "{someTagWithoutValue}" "{someOtherTagWithoutValue}"',
        {
          someTag: 'some tag value',
        },
      );
    }).toThrow(
      'Missing value for "{someTagWithoutValue}", "{someOtherTagWithoutValue}".',
    );
  });

  it('given undefined values for tags, throws', () => {
    expect(() => {
      replaceTagsWithValues(
        'some string "{someTag}" some more string "{someTagWithUndefinedValue}" "{someOtherTagWithUndefinedValue}"',
        {
          someTag: 'some tag value',
          someTagWithUndefinedValue: undefined,
          someOtherTagWithUndefinedValue: undefined,
        },
      );
    }).toThrow(
      'Missing value for "{someTagWithUndefinedValue}", "{someOtherTagWithUndefinedValue}".',
    );
  });

  it('given undefined values for tags but throwing on missing values is omitted, does not alter tags with missing values', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTag}" some more string "{someTagWithUndefinedValue}" "{someOtherTagWithUndefinedValue}"',
      {
        someTag: 'some tag value',
        someTagWithUndefinedValue: undefined,
        someOtherTagWithUndefinedValue: undefined,
      },
      { throwOnMissingTagValues: false },
    );

    expect(actual).toEqual(
      'some string "some tag value" some more string "{someTagWithUndefinedValue}" "{someOtherTagWithUndefinedValue}"',
    );
  });

  it('given null values for tags, replaces to empty string', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTagWithNullValue}"',
      {
        someTagWithNullValue: null,
      },
    );

    expect(actual).toBe('some string ""');
  });

  it('given empty string values for tags, replaces to empty string', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTagWithEmptyStringValue}"',
      {
        someTagWithEmptyStringValue: '',
      },
    );

    expect(actual).toBe('some string ""');
  });

  it('given value containing another tag, replaces recursively until tag has value', () => {
    const actual = replaceTagsWithValues(
      'some string "{someTagContainingAnotherTagAsValue}"',
      {
        someTagContainingAnotherTagAsValue: '{otherTag}',
        otherTag: 'some-value',
      },
    );

    expect(actual).toBe('some string "some-value"');
  });

  it('given tags describing a cycle, throws', () => {
    const actual = () =>
      replaceTagsWithValues(
        'some string "{someTagContainingAnotherTagAsValue}"',
        {
          someTagContainingAnotherTagAsValue:
            '{otherTagContainingOriginalTagAsValue}',
          otherTagContainingOriginalTagAsValue:
            '{someTagContainingAnotherTagAsValue}',
        },
      );

    expect(actual).toThrow();
  });
});
