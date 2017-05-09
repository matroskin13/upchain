const HttpAdapter = require('./lib/http-adapter');
const Cluster = require('./lib/cluster');
const Service = require('./lib/service');
const logger = require('./lib/logger');
const constants = require('./lib/constants');

/**
 * @param {Object} options
 * @param {Number} options.port
 * @param {Member[]} options.members
 * @param {Adapter} options.adapter
 * @param {Boolean} [options.isCors]
 * @param {Boolean} [options.isDisabledLogger]
 */
const createCluster = (options) => {
    if (!options.port) {
        logger.error('Port is not defined. Please specify the application port.');
        return;
    }

    if (!options.members) {
        logger.error('Members is not defined.');
        return;
    }

    if (!options.adapter) {
        logger.error('Adapter is not defined. Please use HTTP adapter or another.');
        return;
    }

    return new Cluster(options);
};

/**
 * @param {Object} options
 * @param {Object[]} options.plugins
 * @param {Adapter} adapter
 */
const createService = (options, adapter) => {
    Object.assign(options, {
        plugins: []
    });

    return new Service(options, adapter);
};

exports.createCluster = createCluster;
exports.createService = createService;
exports.HttpAdapter = HttpAdapter;

Object.assign(exports, constants);

exports.createError = (code, level) => Promise.reject({ code, level });
