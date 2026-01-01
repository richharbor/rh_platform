const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function () {
        return this.slice().reverse();
    };
}

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

// Aggressive resolution for problematic modules
config.resolver.extraNodeModules = {
    'react-async-hook': path.resolve(__dirname, 'node_modules/react-async-hook/dist/react-async-hook.esm.js'),
};

const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(config, { input: './global.css' });
