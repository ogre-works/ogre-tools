import { getInjectable } from '@lensapp/injectable';

export const workingDirectoryInjectable = getInjectable({
  id: 'working-directory',
  instantiate:
    /* c8 ignore next */
    () => process.cwd(),
});
