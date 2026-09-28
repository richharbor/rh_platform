// Metro must watch rhserver/shared/rfin (the RFIN contract: types, states,
// RBAC, HTTP transport), linked as node_modules/@rfin/shared but outside this root.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../../rhserver/shared/rfin")];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

module.exports = config;
