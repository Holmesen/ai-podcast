// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Supabase fix (https://github.com/expo/expo/issues/36375) (https://github.com/supabase/realtime-js/issues/415)
config.resolver.unstable_conditionNames = ['browser'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
