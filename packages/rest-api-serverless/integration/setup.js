// runs before each test

/* eslint-disable @typescript-eslint/no-var-requires */

const axios = require('axios');

axios.defaults.baseURL = process.env.API_BASE_URL;
axios.defaults.headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
};

// force axios to return error response rather than throwing an exception
axios.defaults.validateStatus = () => true;
