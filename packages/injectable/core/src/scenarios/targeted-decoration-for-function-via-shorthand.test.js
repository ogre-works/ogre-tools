import getInjectable from '../getInjectable/getInjectable';
import createContainer from '../dependency-injection-container/createContainer';
import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

describe('createContainer.targeted-decoration-for-function-via-shorthand', () => {
  it('given decorating function, when called, returns the decorated value', () => {
    const someInjectable = getInjectable({
      id: 'some-some-injectable',

      instantiate: (di, instantiationParameter) => parameter =>
        `some(${instantiationParameter}(${parameter}))`,

      lifecycle: lifecycleEnum.transient,
    });

    const di = createContainer('some-container');

    di.register(someInjectable);

    const decorator =
      toBeDecorated =>
      (...args) =>
        `decorator(${toBeDecorated(...args)})`;

    di.decorateFunction(someInjectable, decorator);

    const getActual = di.inject(someInjectable, 'some-instantiation-parameter');

    const actual = getActual('some-parameter');

    expect(actual).toBe(
      'decorator(some(some-instantiation-parameter(some-parameter)))',
    );
  });
});
