class MockAdapterServer {}
class MockAdapterClient {}

module.exports = {
    name: 'mockAdapter',
    Client: MockAdapterClient,
    Server: MockAdapterServer
};