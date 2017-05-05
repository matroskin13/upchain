const express = require('express');
const bodyParser = require('body-parser');

const constants = require('./constants');
const logger = require('./logger');

/**
 * @typedef {Object} Member
 * @property {String} name - unique name of the service
 * @property {String} [host] - full address of the service. format host:port
 */

class Cluster {
    constructor(options) {
        if (!options.isDisabledLogger) {
            logger.info(`Create cluster. Port: ${options.port}. Use ${options.adapter.name} adapter.`);
            logger.info(`Members of cluster:\n${options.members.map(m => `\t - ${m.name}, host: ${m.host}`).join('\n')}`);
        }

        this.port = options.port;
        this.members = options.members;
        this.adapter = new options.adapter.Client(this.members);

        let app = express();
        let router = this.mapping();

        if (options.isCors) {
            app.use(function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });
        }

        app.use(bodyParser.json());
        app.use(router);

        app.listen(options.port);
    }

    mapping() {
        let router = express.Router();

        router.post('/entry', this.entry.bind(this));

        return router;
    }

    entry(req, res, next) {
        const { input, async = false, mapping = [] } = req.body;

        logger.info('Input request', JSON.stringify(input));

        this.adapter
            .action(input, mapping, async)
            .then(data => res.json(data))
            .catch(errors => {
                logger.error(errors);
                res.json({ status: false, errors });
            });
    }
}

module.exports = Cluster;
