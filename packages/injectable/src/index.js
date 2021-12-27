import createContainer from './dependency-injection-container/createContainer';
import lifecycleEnum from './dependency-injection-container/lifecycleEnum';

const getInjectionToken = () => ({});
const getInjectable = injectable => injectable;

export { createContainer, lifecycleEnum, getInjectionToken, getInjectable };
