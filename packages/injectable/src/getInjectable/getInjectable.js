import lifecycleEnum from '../dependency-injection-container/lifecycleEnum';

export default ({ lifecycle = lifecycleEnum.singleton, ...injectable }) => ({
  lifecycle,
  ...injectable,
});
