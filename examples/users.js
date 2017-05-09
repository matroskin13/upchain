const lodash = require('lodash');
const { createService, HttpAdapter, createError, LEVEL_NOTICE } = require('../');

let userService = createService({ port: 3011 }, HttpAdapter);

userService.input('authToken', (input, payload) => {
    if (input.authToken === 'my_secret_token') {
        payload.currentUser = { id: 1, name: 'tester' };
    } else {
        return createError('invalid_token', LEVEL_NOTICE);
    }
});

userService.start();
