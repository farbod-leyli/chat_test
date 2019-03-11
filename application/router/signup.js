"use strict"
module.exports = {
    SignUp: (req, res) => {
        if (
            // checking inputs

            req.body.username == '' || typeof req.body.username == 'undefined' ||
            req.body.password == '' || typeof req.body.password == 'undefined' ||
            req.body.email == '' || typeof req.body.email == 'undefined' ||
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

            // checking inputs availability

            Controller.checkUsername(req).then(() => {
                Controller.checkPassword(req).then(() => {


                    // creating user in database
                    const { User, Password } = require('../data_models/_model_sequelizer');
                    Password.create()
                    User.create({
                        username: req.body.username.toLowerCase(),
                        lastLoginDate: date,
                        Password: {
                            password: md5(req.body.password)
                        }
                    }, { include: [Password] })
                        .then(userData => {

                            //creating token for client
                            Controller.createToken(userData.username, userData.id, userData.lastLoginDate, token => {
                                return res.json([{ token: token }]);
                            });

                        }).catch(err => errHandler('signup failed'));
                }).catch(err => errHandler(err));
            }).catch(err => errHandler(err));
        }
    }
}