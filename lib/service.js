const lodash = require('lodash');

const constants = require('./constants');

class Service {
    constructor(options, adapter) {
        this.adapter = adapter;
        this.options = options;

        this.server = new adapter.Server(options, this.listener.bind(this), this.pluginListener.bind(this));

        this.plugins = options.plugins;

        this.events = [];
    }

    listener(input, payload) {
        const useEvents = (type, item, key) => {
            let items = this.events.filter(e => e.type === type && e.property === key);
            let errors = [];
            let promises = items.map(i => {
                return i.callback(item, input, payload)
                    .catch(e => {
                        if (!e.level) {
                            e = { code: constants.ERROR_INTERNAL, level: constants.LEVEL_FATAL };
                        }

                        errors.push(e);

                        if (e.level === constants.LEVEL_FATAL) {
                            return Promise.reject(errors);
                        }
                    });
            });

            return Promise.all(promises).then(() => errors);
        };

        let promises = [];

        lodash.each(input, (item, property) => {
            promises.push(useEvents('input', item, property));
            promises.push(useEvents('all', item, property));
        });

        lodash.each(payload, (item, property) => {
            promises.push(useEvents('payload', item, property));
            promises.push(useEvents('all', item, property));
        });

        return Promise
            .all(promises)
            .then(lodash.flatten);
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

    input(property, callback, options) {
        this.addEvent('input', property, callback, options);
    }

    all(property, callback, options) {
        this.addEvent('all', property, callback, options);
    }

    payload(property, callback, options) {
        this.addEvent('input', property, callback, options);
    }
}

module.exports = Service;
