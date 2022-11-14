export default ({ targetModule, fs, path }) =>
  (base = '.', scanSubDirectories = false, regularExpression = /\.js$/) => {
    const files = new Set();

    function readDirectory(directory) {
      fs.readdirSync(directory).forEach(file => {
        const fullPath = path.resolve(directory, file);

        if (fs.statSync(fullPath).isDirectory()) {
          if (scanSubDirectories) readDirectory(fullPath);

          return;
        }

        if (!regularExpression.test(fullPath)) return;

        files.add(fullPath);
      });
    }

    readDirectory(path.resolve(targetModule.path, base));

    function Module(file) {
      return targetModule.require(file);
    }

    Module.keys = () => [...files.values()];

    return Module;
  };
