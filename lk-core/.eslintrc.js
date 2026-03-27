/**
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ["@typescript-eslint", "jest", "unused-imports"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:security/recommended",
        "plugin:jest/recommended",
        "plugin:jest/style",
    ],
    root: true,
    env: {
        node: true,
        jest: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    rules: {
        indent: [
            "error",
            4,
            { "ignoredNodes": ["PropertyDefinition"] }
        ],
        semi: ["error", "always"],
        "unused-imports/no-unused-imports": "error",
    },
    overrides: [
        {
            parserOptions: {
                project: "./tsconfig.json"
            },
            extends: [
                "plugin:@typescript-eslint/recommended-type-checked"
            ],
            files: ['./**/*.{ts,tsx}'],
            excludedFiles: ['./**/*{spec,test}.{ts,tsx}']
        },
        {
            files: ['./**/*{spec,test}.{ts,tsx}'],
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
                "security/detect-object-injection": "off",
                "jest/no-disabled-tests": "off"
            }
        },
    ]
};
