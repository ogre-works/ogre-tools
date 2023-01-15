import matchAll from './matchAll';

describe('matchAll', () => {
  it('when called with regular expression containing multiple capturing groups and string that is matching, returns matches', () => {
    const actual = matchAll(
      'some-string-{containing}-some-{things-to-be-matched}',
      /{([^}]*)}/,
    );

    expect(actual).toEqual([
      { match: '{containing}', group: 'containing' },
      { match: '{things-to-be-matched}', group: 'things-to-be-matched' },
    ]);
  });

  it('when called with regular expression containing single capturing group and string that is matching, returns matches', () => {
    const actual = matchAll('some-string-{containing}', /{([^}]*)}/);

    expect(actual).toEqual([{ match: '{containing}', group: 'containing' }]);
  });

  it('when called with regular expression with no capturing group and string that is matching, returns matches', () => {
    const actual = matchAll('some', /./);

    expect(actual).toEqual([
      { match: 's', group: null },
      { match: 'o', group: null },
      { match: 'm', group: null },
      { match: 'e', group: null },
    ]);
  });

  it('when called with regular expression and string that is not matching, returns null', () => {
    const actual = matchAll('irrelevant', /{([^}]*)}/);

    expect(actual).toBe(null);
  });
});
