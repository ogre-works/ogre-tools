import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

export const injectableSymbol = 'injectable';

export default ({
  instantiate = (di, ...params) => instantiateFactory(di)(...params),
  instantiateFactory,
  lifecycle = lifecycleEnum.singleton,
  ...injectable
}) => ({
  aliasType: injectableSymbol,
  instantiate,
  lifecycle,
  ...injectable,
});
