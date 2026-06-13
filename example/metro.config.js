const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const root = path.resolve(__dirname, '..');

config.watchFolders = [root];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
];

const forcedModules = ['react', 'react-native', 'react-native-reanimated', 'react-native-gesture-handler', 'react-native-svg'];

const origResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (forcedModules.includes(moduleName)) {
    const forcedPath = path.join(__dirname, 'node_modules', moduleName);
    try {
      return context.resolveRequest(
        { ...context, originModulePath: path.join(__dirname, 'index.js') },
        moduleName,
        platform,
      );
    } catch (e) {
      // fall through
    }
  }
  if (origResolveRequest) {
    return origResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
