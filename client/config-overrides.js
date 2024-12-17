const webpack = require('webpack');

module.exports = function override(config) {
  // Bestehende Konfiguration für Buffer
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "buffer": require.resolve("buffer")
  })
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ])

  // Neue Konfiguration für SVG-Handling
  const fileLoaderRule = config.module.rules.find(rule => rule.test && rule.test.test('.svg'));
  fileLoaderRule.exclude = /\.svg$/;

  config.module.rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  });

  return config;
}