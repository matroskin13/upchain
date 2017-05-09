const Service = require('../../lib/service');
const MockAdapter = require('../mock-adapter');

let service;
let input;
let payload;

beforeEach(() => {
    service = new Service({
        plugins: []
    }, MockAdapter);

    input = {
        test: true
    };

    payload = {
        test: true
    };
});

it('use listener', () => {
    let event = {
        type: 'input',
        property: 'test',
        callback: jest.fn()
    };

    service.events.push(event);

    return service
        .listener(input, payload)
        .then(errors => {
            let calls = event.callback.mock.calls;

            expect(errors).toHaveLength(0);
            expect(calls).toHaveLength(1);
            expect(calls[0]).toEqual([input, payload]);
        });
});
