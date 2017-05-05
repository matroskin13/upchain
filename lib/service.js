const lodash = require('lodash');

const constants = require('./constants');

const INPUT_EVENT = 'input';
const PAYLOAD_EVENT = 'payload';

function useEvent(callback, input, payload) {
    let result = callback(input, payload);

    if (result && 'then' in result) {
        return callback(input, payload).catch(e => {
            if (!e.level) {
                e = { code: constants.ERROR_INTERNAL, level: constants.LEVEL_FATAL };
            }

            return e;
        });
    }

    return null;
}

class Service {
    constructor(options, adapter) {
        this.options = options;

        this.server = new adapter.Server(options, this.listener.bind(this), this.pluginListener.bind(this));
        this.plugins = options.plugins;

        this.events = [];
    }

    listener(input, payload) {
        let promises = this.events.map(event => {
            let inputProperty = input[event.property];
            let payloadProperty = payload[event.property];

            if (inputProperty || payloadProperty) {
                return useEvent(event.callback, input, payload);
            } else {
                return null;
            }
        });

        return Promise
            .all(promises)
            .then(errors => lodash.compact(errors));
    }

    pluginListener(name, query) {
        let plugin = this.plugins.find(plugin => plugin.pluginName === name);

        if (!plugin || !plugin.listener) {
            return null;
        }

        return plugin.listener(query);
    }

    start() {
        this.server.start();
    }

    addEvent(type, property, callback, options) {
        let resultOptions = {};

        if (typeof callback !== 'function' && typeof options === 'function') {
            resultOptions = callback;
            callback = options;
        }

        let event = { type, property, callback };

        this.plugins.forEach(plugin => {
            plugin.addProperty && plugin.addProperty(event, resultOptions);
        });

        this.events.push(event);
    }

    input(property, callback, options = {}) {
        this.addEvent(INPUT_EVENT, property, callback, options);
    }

    payload(property, callback, options = {}) {
        this.addEvent(PAYLOAD_EVENT, property, callback, options);
    }
}

module.exports = Service;
