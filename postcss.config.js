module.exports = {
  plugins: [
    require('autoprefixer')({
      // Automatically add vendor prefixes for better browser support
      overrideBrowserslist: ['> 1%', 'last 2 versions', 'iOS >= 9', 'Android >= 4.4'],
      grid: 'autoplace' // Enable CSS Grid prefixes
    }),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true
      }
    }),
    require('postcss-combine-media-query')() // Combine duplicate media queries
  ]
};
