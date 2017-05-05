const lodash = require('lodash');
const { createService, HttpAdapter, createError, LEVEL_NOTICE } = require('../');

let userService = createService({ port: 3011 }, HttpAdapter);

userService.all('usersIds', (input, payload) => {
    payload.users = input.usersIds.map(id => ({ id, name: 'user' + id }));
});

userService.all('error', () => createError('invalid_user', LEVEL_NOTICE));

userService.start();
