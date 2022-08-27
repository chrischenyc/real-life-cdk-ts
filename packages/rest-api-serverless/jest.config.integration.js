/**
 * Jest config for integration test
 * @see https://jestjs.io/docs/configuration
 */

module.exports = {
    roots: ['<rootDir>/integration'],
    globalSetup: '<rootDir>/integration/global-setup.js',
    setupFiles: ['<rootDir>/integration/setup.js'],
    testRegex: '(.*.(test|spec)).(jsx?|tsx?)$',
    testTimeout: 60000,
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};
