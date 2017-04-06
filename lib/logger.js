const chalk = require('chalk');

let isProduction = process.env.NODE_ENV === 'production';

let c = new chalk.constructor({enabled: !isProduction});

function log(type, logs) {
    type = c.underline(type);

    console.log.apply(console, [type].concat(logs));
}

module.exports = {
    chalk() {
        return c;
    },

    error(...logs) {
        log(`${c.red('error:')}`, logs);
    },

    info(...logs) {
        log(`${c.yellow(`info:`)}`, logs);
    }
};
