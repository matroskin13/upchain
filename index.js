const HttpAdapter = require('./lib/http-adapter');
const Cluster = require('./lib/cluster');
const Service = require('./lib/service');

const constants = require('./lib/constants');

const createCluster = ({ port, members = [], adapter }) => new Cluster(port, members, adapter);
const createService = (options, adapter) => new Service(options, adapter);

exports.createCluster = createCluster;
exports.createService = createService;
exports.HttpAdapter = HttpAdapter;

Object.assign(exports, constants);

exports.createError = (code, level) => Promise.reject({ code, level });
