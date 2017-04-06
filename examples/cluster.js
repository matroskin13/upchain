const { createCluster, HttpAdapter } = require('../')

createCluster({
    port: 3009,
    members: [
        { name: 'tokens', host: 'http://localhost:3010' },
        { name: 'users', host: 'http://localhost:3011' }
    ],
    adapter: HttpAdapter
});
