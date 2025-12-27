const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(config, { input: './global.css' });
