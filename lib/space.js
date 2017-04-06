const lodash = require('lodash');

class Space {
    add(item) {
        if (!this.data) {
            this.data = [];
        }

        this.data = this.data.concat(item);
    }
}

module.exports = Space;
