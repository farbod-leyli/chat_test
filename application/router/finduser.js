"use strict"
module.exports = {
    FindUser: (req, res) => {
        const { User } = require('../data_models/_model_sequelizer');

        if (req.body.username) {
            User.findAll({ username: req.body.username }).then(data => {
                if (data) {
                    return res.json(data);
                } else {
                    return res.status(403).send('not found');
                }
            }).catch(err => { return res.status(403).send('not found') });
        }
    }
}