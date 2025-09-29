module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Third-party libraries
    Chart: 'readonly',
    html2canvas: 'readonly',
    AdvancedReportGenerator: 'readonly',

    // Custom globals
    neurlyn: 'readonly',
    NeurlynAdaptiveAssessment: 'readonly',
    ReportDisplayComponent: 'readonly',

    // Test globals
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    jest: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
