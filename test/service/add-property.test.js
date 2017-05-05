const Service = require('../../lib/service');
const MockAdapter = require('../mock-adapter');

let service;

beforeEach(() => {
    service = new Service({
        plugins: []
    }, MockAdapter);
});

it('initial events is empty', () => {
    expect(service.events).toHaveLength(0);
});

it('add test event', () => {
    let callback = jest.fn();

    service.addEvent('input', 'test', callback);

    expect(service.events).toHaveLength(1);
    expect(service.events[0]).toEqual({
        type: 'input',
        property: 'test',
        callback
    });
});

it('add event with options', () => {
    let callback = jest.fn();
    let options = { test: true };

    service.addEvent('input', 'test', options, callback);

    expect(service.events).toHaveLength(1);
    expect(service.events[0]).toEqual({
        type: 'input',
        property: 'test',
        callback
    });
});

it('add multiple events', () => {
    service.addEvent('input', 'test', () => {});
    service.addEvent('input', 'custom', () => {});

    expect(service.events).toHaveLength(2);
});

it('input and payload methods', () => {
    let callback = () => {};

    service.addEvent = jest.fn();
    service.input('test', callback, {});
    service.payload('test', callback, {});

    let calls = service.addEvent.mock.calls;

    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual(['input', 'test', callback, {}]);
    expect(calls[1]).toEqual(['payload', 'test', callback, {}]);
});