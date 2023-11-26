import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

export const injectableSymbol = 'injectable';

export default ({
  instantiate,
  lifecycle = lifecycleEnum.singleton,
  ...injectable
}) => ({
  version: 1,
  aliasType: injectableSymbol,
  instantiate: di => param => instantiate(di, param),
  lifecycle,
  ...injectable,
});
