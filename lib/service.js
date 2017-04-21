const lodash = require('lodash');

const constants = require('./constants');

class Service {
    constructor(options, adapter) {
        this.adapter = adapter;
        this.options = options;

        this.server = new adapter.Server(options, this.listener.bind(this));

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

    start() {
        this.server.start();
    }

    addEvent(type, property, callback) {
        this.events.push({ type, property, callback });
    }

    input(property, callback) {
        this.addEvent('input', property, callback);
    }

    all(property, callback) {
        this.addEvent('all', property, callback);
    }

    payload(property, callback) {
        this.addEvent('input', property, callback);
    }
}

module.exports = Service;
