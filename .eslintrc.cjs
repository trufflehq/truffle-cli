module.exports = {
  env: {
    node: true
  },
  extends: ['standard'],
  // only necessary because we use clsas properties
  // https://stackoverflow.com/questions/60046847/eslint-does-not-allow-static-class-properties
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  overrides: [
    {
      files: 'cli.js',
      rules: {
        'spaced-comment': 0
      }
    }
  ],
  rules: {
    'react/prop-types': 0,
    quotes: 0
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    globalThis: false // means it is not writeable
  }
}
