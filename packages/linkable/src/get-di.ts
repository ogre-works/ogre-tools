import { autoRegister } from '@lensapp/injectable-extension-for-auto-registration';
import { createContainer } from '@lensapp/injectable';

export const getDi = () => {
  const di = createContainer('linkable');

  autoRegister({
    di,
    targetModule: module,
    getRequireContexts: () => [
      require.context('./', true, /\.injectable\.(ts|tsx)$/),
    ],
  });

  return di;
};
