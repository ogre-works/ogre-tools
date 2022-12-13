import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';

describe('createContainer.ad-hoc-injection', () => {
  it('given non-registered ad-hoc injectable, when injected, injects', () => {
    const adHocInjectable = getInjectable({
      id: 'some-ad-hoc-injectable',
      adHoc: true,
      instantiate: () => ({}),
    });

    const di = createContainer('some-container');

    const actual1 = di.inject(adHocInjectable);
    const actual2 = di.inject(adHocInjectable);

    expect(actual1).toBe(actual2);
  });
});
