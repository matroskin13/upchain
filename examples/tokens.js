const lodash = require('lodash');
const { createService, HttpAdapter } = require('../');

let tokensService = createService({ port: 3010 }, HttpAdapter);

tokensService.input('token', (property, input, payload) => {
    switch (property.type) {
        case 'auth':
            payload.usersIds = [1];
            break;
    }
});

tokensService.start();
