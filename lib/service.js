const lodash = require('lodash');

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
            let promises = items.map(i => i.callback(item, input, payload));

            return Promise.all(promises);
        }

        let promises = [];

        lodash.each(input, (item, property) => {
            promises.push(useEvents('input', item, property));
            promises.push(useEvents('all', item, property));
        });

        lodash.each(payload, (item, property) => {
            promises.push(useEvents('payload', item, property));
            promises.push(useEvents('all', item, property));
        });

        return Promise.all(promises);
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
