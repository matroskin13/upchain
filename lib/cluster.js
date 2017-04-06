const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./logger');

class Cluster {
    constructor(port, members, adapter) {
        logger.info(`Create cluster. Port: ${port}. Use ${adapter.name} adapter.`);
        logger.info(`Members of cluster:\n${members.map(m => `\t - ${m.name}, host: ${m.host}`).join('\n')}`);

        this.port = port;
        this.members = members;
        this.adapter = new adapter.Client(members);

        let app = express();
        let router = this.mapping();

        app.use(bodyParser.json());
        app.use(router);

        app.listen(port);
    }

    mapping() {
        let router = express.Router();

        router.post('/entry', this.entry.bind(this));

        return router;
    }

    entry(req, res, next) {
        const { input, async = false } = req.body;

        logger.info('Input request', JSON.stringify(input));

        this.adapter
            .action(input, async)
            .then(data => res.json(data))
            .catch(e => res.json(e));
    }
}

module.exports = Cluster;
