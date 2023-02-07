module.exports = {
  settings: {
    next: {
      rootDir: "./",
    },
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
      node: true,
    },
  },
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  rules: {
    "array-callback-return": 2,
    eqeqeq: 2,
    "no-inline-comments": 0,
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "[iI]gnored$",
      },
    ],
    "prefer-destructuring": 2,
    "prefer-object-spread": 2,
    "prefer-template": 2,
    radix: 2,
    "~~~ disabled rules covered by tslint ~~~": 0,
    "no-empty-function": 0,
    "no-duplicate-imports": 0,
    "no-shadow": 0,
    "no-unused-vars": 0,
  },
};
