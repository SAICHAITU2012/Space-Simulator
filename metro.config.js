const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("glb", "gltf", "bin", "hdr", "xjpg", "xpng");
config.resolver.sourceExts.push("mjs", "cjs");

module.exports = config;
