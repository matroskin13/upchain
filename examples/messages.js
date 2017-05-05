const lodash = require('lodash');
const { createService, HttpAdapter, createError, LEVEL_NOTICE } = require('../');

let messagesService = createService({ port: 3012 }, HttpAdapter);

messagesService.input('userMessages', (input, payload) => {
    if (!payload.currentUser) {
        return createError('access_denied', LEVEL_NOTICE);
    }

    let userId = payload.currentUser.id;

    payload.messages = [
        { id: 1, author: userId, text: 'Hello world' },
        { id: 2, author: userId, text: 'Hello Upchain' }
    ];
});

messagesService.start();
