const { createCluster, HttpAdapter } = require('../');

createCluster({
    port: 3009,
    members: [
        { name: 'users', host: 'http://localhost:3011' },
        { name: 'messages', host: 'http://localhost:3012' }
    ],
    adapter: HttpAdapter
});
