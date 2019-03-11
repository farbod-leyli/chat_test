"use strict"
module.exports = {
    Login: (req, res) => {
        if (
            // Checking inputs

            req.body.username == '' || typeof req.body.username == 'undefined' ||
            req.body.password == '' || typeof req.body.password == 'undefined' ||
            req.body.username.length < 6 || req.body.username.length > 15 ||
            req.body.password.length < 6 || req.body.password.length > 15
        ) {
            return res.status(400).send('bad input');
        } else {

            const Controller = require('../controller');
            let errHandler = Controller.errorHandler;
            const md5 = require('js-md5');
            const jwt = require(jwt);
            let date = new Date();

            const { User, Password } = require('../data_models/_model_sequelizer');

            // checking login informations

            User.findOne({ username: req.body.username.toLowerCase() }, { include: [Password] }).then(userData => {
                if (userData.password.password == md5(req.body.password)) {

                    //updating user data and sending new token to client
                    User.update({ lastLoginDate: date }, { where: { id: userData.id } })
                        .then(() => {

                            Controller.createToken(userData.username, userData.id, date, token => {
                                return res.json([{ token: token }]);
                            });

                        }).catch(err => errHandler('login failed'))
                }
            }).catch(err => errHandler('login failed'));
        }
    }
}