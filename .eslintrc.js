module.exports = {
  root: true,
  extends: ['handlebarlabs', 'plugin:prettier/recommended'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'import/no-mutable-exports': 0,
  },
  globals: {},
  plugins: ['eslint-plugin-import'],
};
