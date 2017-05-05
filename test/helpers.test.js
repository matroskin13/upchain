const helpers = require('../lib/helpers');

it('helpers waterfall', () => {
    let results = [];

    let first = data => new Promise(resolve => {
        setTimeout(() => {
            results.push(2);
            data.first = 1;
            resolve(data);
        }, 200);
    });

    let second = data => new Promise(resolve => {
        setTimeout(() => {
            results.push(1);
            data.second = 2;
            resolve(data);
        }, 100);
    });

    return helpers.waterfall([ first, second ], {}).then(data => {
        expect(results).toEqual([2, 1]);
        expect(data).toEqual({
            first: 1,
            second: 2
        });
    });
});