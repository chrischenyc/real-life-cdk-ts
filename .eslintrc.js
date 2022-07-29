module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier', 'simple-import-sort'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    rules: {
        'prettier/prettier': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
    },
    env: {
        node: true,
    },
};
