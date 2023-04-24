import { getDi } from './src/get-di';
import { createLinksInjectable } from './src/create-links.injectable';

const di = getDi();

const createLinks = di.inject(createLinksInjectable);

createLinks();
