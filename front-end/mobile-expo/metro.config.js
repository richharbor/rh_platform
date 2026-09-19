const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function () {
        return this.slice().reverse();
    };
}

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

// This package's module field points outside dist; resolve its shipped entry.
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-async-hook') {
        return {
            type: 'sourceFile',
            filePath: path.resolve(__dirname, 'node_modules/react-async-hook/dist/react-async-hook.esm.js'),
        };
    }
    return context.resolveRequest(context, moduleName, platform);
};

const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(config, { input: './global.css' });
