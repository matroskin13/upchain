Upchain is a modern solution for communication between microservices.

## Install

```console
$ npm install --save upchain
```

## Create cluster

```js
const { createCluster, HttpAdapter } = require('upchain');

createCluster({
    port: 3009,
    members: [
        { name: 'users', host: 'http://localhost:3011' }
    ],
    adapter: HttpAdapter
});
```

## Create service

```js
const { createService, HttpAdapter, createError, LEVEL_NOTICE } = require('upchain');

let userService = createService({ port: 3011 }, HttpAdapter);

userService.input('authToken', (input, payload) => {
    if (input.authToken === 'my_secret_token') {
        payload.currentUser = { id: 1, name: 'tester' };
    } else {
        return createError('invalid_token', LEVEL_NOTICE);
    }
});

userService.start();

```