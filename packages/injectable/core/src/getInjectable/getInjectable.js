import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

export const injectableSymbol = 'injectable';

export default ({
  instantiateFactory,
  instantiate = (di, ...params) => instantiateFactory(di)(...params),
  lifecycleFactory,
  lifecycle = lifecycleFactory
    ? {
        ...lifecycleFactory,
        getInstanceKey: (di, ...params) =>
          lifecycleFactory.getInstanceKey(di)(...params),
      }
    : lifecycleEnum.singleton,
  ...injectable
}) => ({
  aliasType: injectableSymbol,
  instantiate,
  lifecycle,
  ...injectable,
});
