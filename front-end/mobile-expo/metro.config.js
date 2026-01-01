const { getDefaultConfig } = require('expo/metro-config');

if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function () {
        return this.slice().reverse();
    };
}

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(config, { input: './global.css' });
