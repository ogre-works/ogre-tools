import { firstMatchValue as firstMatchValueFor } from './firstMatchValue';
import { constant, get } from 'lodash/fp';

describe('firstMatchValue', () => {
  describe('given array of functions used for finding', () => {
    let firstMatchValue;
    let finderMock;

    beforeEach(() => {
      finderMock = jest.fn();

      firstMatchValue = firstMatchValueFor(
        constant(undefined),
        get('someProperty'),
        finderMock,
      );
    });

    describe('when called with data containing a match', () => {
      let actual;

      beforeEach(() => {
        actual = firstMatchValue({ someProperty: 'some-value' });
      });

      it('returns the matched value from the matcher of highest priority', () => {
        expect(actual).toBe('some-value');
      });

      it('does not call matchers of less priority than the one matching', () => {
        expect(finderMock).not.toHaveBeenCalled();
      });
    });

    describe('when called with data not containing a match', () => {
      let actual;

      beforeEach(() => {
        actual = firstMatchValue({ someOtherProperty: 'irrelevant' });
      });

      it('returns undefined', () => {
        expect(actual).toBeUndefined();
      });

      it('calls all matchers', () => {
        expect(finderMock).toHaveBeenCalledWith({
          someOtherProperty: 'irrelevant',
        });
      });
    });
  });
});
