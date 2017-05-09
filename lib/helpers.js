const helpers = {
    waterfall(promises, data) {
        let promise = promises.shift();

        return promise(data).then(data => {
            if (promises.length) {
                return helpers.waterfall(promises, data);
            } else {
                return data;
            }
        })
    }
};

module.exports = helpers;
