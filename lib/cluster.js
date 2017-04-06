const express = require('express');
const bodyParser = require('body-parser');

class Cluster {
    constructor(port, members, adapter) {
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

        this.adapter
            .action(input, async)
            .then(data => res.json(data))
            .catch(e => res.send(e));
    }
}

module.exports = Cluster;
