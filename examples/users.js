const lodash = require('lodash');
const { createService, HttpAdapter } = require('../');

let userService = createService({ port: 3011 }, HttpAdapter);

userService.all('usersIds', (property, input, payload) => {
    payload.users = property.map(id => ({ id, name: 'user' + id }));
});

userService.start();
