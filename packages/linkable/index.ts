import { getDi } from './src/get-di';
import { createLinksInjectable } from './src/create-links.injectable';
import { pushLinkInjectable } from './src/push-link.injectable';

const di = getDi();

const createLinks = di.inject(createLinksInjectable);
const pushLink = di.inject(pushLinkInjectable);

export { createLinks, pushLink };
