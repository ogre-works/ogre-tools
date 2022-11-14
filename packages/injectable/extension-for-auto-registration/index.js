import fs from 'fs';
import path from 'path';

import autoRegisterFor from './src/autoRegister';

export const autoRegister = autoRegisterFor({ fs, path });
