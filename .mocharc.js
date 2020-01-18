module.exports = {
    diff: true,
    extension: ['js'],
    opts: false,
    package: './package.json',
    reporter: 'spec',
    slow: 75,
    timeout: 2000,
    ui: 'bdd',
    //'watch-files': ['istanbul/**/*.js'],
    'watch-ignore': ['lib/vendor'],
    //recursive: "./istanbul/**/*spec.js"
  };