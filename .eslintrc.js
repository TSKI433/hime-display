module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["plugin:vue/essential", "prettier", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["vue"],
  rules: {
    "prettier/prettier": "warn",
  },
};
