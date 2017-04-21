const request = require('request');
const express = require('express');
const lodash = require('lodash');
const bodyParser = require('body-parser');

const constants = require('./constants');
const logger = require('./logger');
const { waterfall } = require('./helpers');

/**
 * @typedef {Object} Adapter
 * @property {String} name - unique name of the adapter
 * @property {Object} Client
 * @property {Object} Server
 */

class HttpAdapterClient {
    constructor(services) {
        this.services = services;
    }

    action(input, mapping, isAsync = false) {
        let services = mapping.length ? this.services.filter(s => mapping.includes(s.name)) : this.services;

        if (isAsync) {
            return this.async(input);
        } else {
            let promises = services.map(service => data => this.serviceRequest(service, input, data));

            return waterfall(promises, { status: true, errors: [], payload: {} });
        }
    }

    async(input) {
        let promises = this.services.map(service => this.serviceRequest(service, input, {}));

        return Promise
            .all(promises)
            .then(data => data.reduce((prev, current) => Object.assign(prev, current), {}));
    }

    serviceRequest(service, input, data) {
        logger.info(`request to ${service.name}`);

        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                url: `${service.host}/action`,
                json: { input, payload: data.payload }
            }, (err, response, body) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                body.errors = [...data.errors, ...body.errors];

                if (lodash.find(body.errors, { level: constants.LEVEL_FATAL })) {
                    return reject(body);
                }

                resolve(body);
            });
        });
    }
}

class HttpAdapterServer {
    constructor(options, listener) {
        this.port = options.port;
        this.listener = listener;

        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(this.mapping());

        logger.info(`init HTTP service. port: ${this.port}`);
    }

    mapping() {
        let router = express.Router();

        router.post('/action', this.action.bind(this));

        return router;
    }

    action(req, res, next) {
        const { input, payload } = req.body;

        this.listener(input, payload)
            .then(errors => res.json({ status: true, payload, errors }))
            .catch(errors => {
                errors.forEach(e => {
                    logger.error(e);
                });

                res.json({ status: false, payload, errors });
            });
    }

    start() {
        this.app.listen(this.port);
    }
}

module.exports = {
    name: 'HTTP',
    Client: HttpAdapterClient,
    Server: HttpAdapterServer
};
