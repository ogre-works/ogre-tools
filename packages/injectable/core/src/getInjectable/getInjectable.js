import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

export const injectableSymbol = 'injectable';

export default ({ lifecycle = lifecycleEnum.singleton, ...injectable }) => ({
  version: 1,
  aliasType: injectableSymbol,
  lifecycle,
  ...injectable,
});
