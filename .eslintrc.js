module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 12
  },
  plugins: ['@typescript-eslint'],
  extends: ['nestjs'],
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    eqeqeq: ['error', 'always'],
    'object-curly-newline': ['error', { multiline: true }],
    curly: ['error', 'all'],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'func-call-spacing': ['error', 'never'],
    semi: ['error', 'always'],
    'semi-spacing': ['error', { before: false, after: true }],
    'semi-style': ['error', 'last'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
        modifiers: ['global']
      }
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'error'
  }
};
