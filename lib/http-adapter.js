const request = require('request');
const express = require('express');
const lodash = require('lodash');
const bodyParser = require('body-parser');

const constants = require('./constants');
const logger = require('./logger');
const { waterfall } = require('./helpers');

class HttpAdapterClient {
    constructor(services) {
        this.services = services;
    }

    action(input, isAsync = false) {
        if (isAsync) {
            return this.async(input);
        } else {
            let promises = this.services.map(service => data => this.serviceRequest(service, input, data));

            return waterfall(promises, {});
        }
    }

    async(input) {
        let promises = this.services.map(service => this.serviceRequest(service, input, {}));

        return Promise
            .all(promises)
            .then(data => data.reduce((prev, current) => Object.assign(prev, current), {}));
    }

    serviceRequest(service, input, payload) {
        logger.info(`request to ${service.name}`);

        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                url: `${service.host}/action`,
                json: { input, payload }
            }, (err, response, body) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                if (!body.status) {
                    logger.error(body.error);

                    if (body.error.level === constants.LEVEL_FATAL) {
                        return reject(body.error);
                    }
                }

                resolve(body.payload);
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
            .then(() => res.json({ status: true, payload }))
            .catch(e => {
                logger.error(e);
                res.json({ status: false, payload, error: e });
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
