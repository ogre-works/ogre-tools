import { getInjectionToken } from './getInjectionToken';

describe('universal-reference-of-tokens', () => {
  it('given tokens with same domain and same id, references are the same', () => {
    const actual1 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    });

    const actual2 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    });

    expect(actual1).toBe(actual2);
  });

  it('given tokens with same no domain and same id, references are not the same', () => {
    const actual1 = getInjectionToken({
      id: 'some-token',
    });

    const actual2 = getInjectionToken({
      id: 'some-token',
    });

    expect(actual1).not.toBe(actual2);
  });

  it('given tokens with different domain and same id, references are not the same', () => {
    const actual1 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    });

    const actual2 = getInjectionToken({
      id: 'some-token',
      domain: 'some-other-domain',
    });

    expect(actual1).not.toBe(actual2);
  });

  it('given tokens with same domain and different id, references are not the same', () => {
    const actual1 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    });

    const actual2 = getInjectionToken({
      id: 'some-different-token',
      domain: 'some-domain',
    });

    expect(actual1).not.toBe(actual2);
  });

  it('given tokens with same domain and same id and same specificity, references are the same', () => {
    const actual1 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    }).for('some-specificity');

    const actual2 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    }).for('some-specificity');

    expect(actual1).toBe(actual2);
  });

  it('given tokens with same domain and same id and different specificity, references are not the same', () => {
    const actual1 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    }).for('some-specificity');

    const actual2 = getInjectionToken({
      id: 'some-token',
      domain: 'some-domain',
    }).for('some-other-specificity');

    expect(actual1).not.toBe(actual2);
  });
});
