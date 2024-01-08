import { getInjectable } from '@lensapp/injectable';
import { resolvePathInjectable } from '../shared/path/resolve-path.injectable';
import { workingDirectoryInjectable } from '../shared/working-directory.injectable';

const configFilePathInjectable = getInjectable({
  id: 'config-file-path',

  instantiate: di => {
    const resolvePath = di.inject(resolvePathInjectable);
    const workingDirectory = di.inject(workingDirectoryInjectable);

    return resolvePath(workingDirectory, '.linkable.json');
  },
});

export default configFilePathInjectable;
