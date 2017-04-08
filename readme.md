Upchain is a modern solution for communication between microservices.

## Install

```console
$ npm install --save upchain
```

## Create cluster

```js
const { createCluster, HttpAdapter } = require('upchain')

createCluster({
    port: 3009,
    members: [
        { name: 'tokens', host: 'http://localhost:3010' },
        { name: 'users', host: 'http://localhost:3011' }
    ],
    adapter: HttpAdapter
});
```

## Create service

```js
const { createService, HttpAdapter } = require('upchain');

let userService = createService({ port: 3011 }, HttpAdapter);

userService.input('usersIds', (property, input, payload) => {
    payload.users = property.map(id => ({ id, name: 'user' + id }));
});

userService.start();
```