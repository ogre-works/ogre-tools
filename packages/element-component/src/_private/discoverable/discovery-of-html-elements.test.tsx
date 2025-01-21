import * as React from 'react';
import { render } from '@testing-library/react';
import { Discover, discoverFor } from './discovery-of-html-elements';

describe('discovery-of-html-elements', () => {
  describe('given multiple matches', () => {
    let discover: Discover;

    beforeEach(() => {
      const rendered = render(
        <div>
          <div data-some-attribute-test="some-first-value" />
          <div data-some-attribute-test="some-second-value" />
          <div
            data-some-other-attribute-test="some-value"
            data-some-third-attribute-test="10"
          />
          <div
            data-some-other-attribute-test="some-value"
            data-some-third-attribute-test="12"
          />
        </div>,
      );

      discover = discoverFor(() => rendered);
    });

    it('when querying single element, throws', () => {
      expect(() => {
        discover.querySingleElement('some-attribute');
      }).toThrow(
        'Tried to discover single "[data-some-attribute-test]", but found multiple matches.',
      );
    });

    it('when getting single element, throws', () => {
      expect(() => {
        discover.getSingleElement('some-attribute');
      }).toThrow(
        'Tried to discover single "[data-some-attribute-test]", but found multiple matches.',
      );
    });

    it('when querying all elements, returns all elements having the attribute', () => {
      expect(
        discover.queryAllElements('some-attribute').attributeValues,
      ).toEqual(['some-first-value', 'some-second-value']);
    });

    it('when querying all elements with same attribute value, returns all elements having the attribute value', () => {
      expect(
        discover.queryAllElements('some-attribute', 'some-first-value')
          .attributeValues,
      ).toEqual(['some-first-value']);
    });

    it('when querying all elements with the same attribute value, when getting a single element from that set, returns', () => {
      expect(
        discover
          .queryAllElements('some-other-attribute', 'some-value')
          .getSingleElement('some-third-attribute', '10').discovered,
        // @ts-ignore
      ).toBeInTheDocument();
    });
  });

  describe('accessing attribute values', () => {
    describe('given there are elements with discoverable attribute values', () => {
      let discover: Discover;

      beforeEach(() => {
        const rendered = render(
          <div>
            <div
              data-some-attribute-test="some-first-value"
              data-some-different-test="other-value"
            />
            <div data-some-attribute-test="some-third-value" />
            <div data-some-other-attribute-test="some-second-value" />
          </div>,
        );

        discover = discoverFor(() => rendered);
      });

      it('a discovered element has an attribute field', () => {
        expect(
          discover.getSingleElement('some-other-attribute').attributeValue,
        ).toBe('some-second-value');
      });

      it('a discovered element can discover attributes on the same element', () => {
        expect(
          discover
            .getSingleElement('some-attribute', 'some-first-value')
            .getAttribute('some-different'),
        ).toBe('other-value');
      });

      it('multiple discovered elements can discover attributes on the same elements', () => {
        expect(
          discover
            .queryAllElements('some-attribute')
            .getAttributes('some-different'),
        ).toEqual(['other-value', null]);
      });
    });
  });

  describe('clicking single elements', () => {
    describe('given there are elements with discoverable attribute values', () => {
      let discover: Discover;
      let clickSpy: jest.MockedFunction<VoidFunction>;
      let rightClickSpy: jest.MockedFunction<VoidFunction>;

      beforeEach(() => {
        clickSpy = jest.fn();
        rightClickSpy = jest.fn();
        const rendered = render(
          <div>
            <div
              data-some-attribute-test="some-first-value"
              data-some-different-test="other-value"
            />
            <div
              data-some-attribute-test="some-third-value"
              onClick={clickSpy}
              onContextMenu={rightClickSpy}
            />
            <div data-some-other-attribute-test="some-second-value" />
          </div>,
        );

        discover = discoverFor(() => rendered);
      });

      describe('when clicking', () => {
        beforeEach(async () => {
          await discover
            .getSingleElement('some-attribute', 'some-third-value')
            .click();
        });

        it('does a click', () => {
          expect(clickSpy).toHaveBeenCalled();
        });
      });

      describe('when right clicking', () => {
        beforeEach(async () => {
          await discover
            .getSingleElement('some-attribute', 'some-third-value')
            .rightClick();
        });

        it('does not call the onClick handler', () => {
          expect(clickSpy).not.toHaveBeenCalled();
        });

        it('calls the onContextMenu handler', () => {
          expect(rightClickSpy).toHaveBeenCalled();
        });
      });

      describe('when double clicking', () => {
        beforeEach(async () => {
          await discover
            .getSingleElement('some-attribute', 'some-third-value')
            .doubleClick();
        });

        it('does two clicks', () => {
          expect(clickSpy).toHaveBeenCalledTimes(2);
        });
      });

      it('clicking returns a promise (due to technical reasons)', () => {
        expect(
          discover
            .getSingleElement('some-attribute', 'some-third-value')
            .click(),
        ).toBeInstanceOf(Promise);
      });
    });
  });
});
