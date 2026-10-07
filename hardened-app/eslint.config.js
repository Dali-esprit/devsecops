import security from "eslint-plugin-security";

export default [
  {
    files: ["**/*.js"],
    plugins: {
      security
    },
    rules: {
      ...security.configs.recommended.rules
    }
  }
];
