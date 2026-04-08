/* const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
/* const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

*/

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    blockList: [
      /node_modules\/.*\/android\/.*/,
      /node_modules\/.*\/ios\/.*/,
    ],
  },
});

// Pass your global.css file here
module.exports = withNativeWind(config, { input: './global.css' });
