// async function runs before all test
// https://jestjs.io/docs/configuration#globalsetup-string

module.exports = async function () {
    /* eslint-disable @typescript-eslint/no-var-requires */
    require('dotenv').config({
        path: `integration/${process.env.ENV || 'dev'}.env`,
    });
};
