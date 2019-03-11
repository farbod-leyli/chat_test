module.exports = {
    errorHandler: (err) => {
        return res.status(403).send(err);
    },
    
    checkUsername: (req) => {
        //it controls username input text

        let promise = new Promise((resolve, reject) => {
            let result = /^([a-zA-Z0-9_])+$/.test(req.body.username);
            let checkArray = [/admin/, /fuck/, /sex/, /__/]
            let m = 0;
            for (let i = 0; i < checkArray.length; i++) {
                if (checkArray[i].test(req.body.username) == true) m += 1
            }
            if (result == false || m != 0) {
                reject('bad input');
            } else {
                const { User } = require('./data_models/_model_sequelizer');
                User.count({ where: { username: req.body.username.toLowerCase() } })
                    .then(userCount => {
                        if (userCount == 0) {
                            resolve('username is ok');
                        } else {
                            reject('username is not available')
                        }
                    })
                    .catch(() => {
                        reject('user not found')
                    });
            }
        });
        return promise;
    },


    checkPassword: (req) => {
        //it controls password input text

        let promise = new Promise((resolve, reject) => {
            let checkArray = [/000000/, /123456/]
            let m = 0;
            for (let i = 0; i < checkArray.length; i++) {
                if (checkArray[i].test(req.body.password) == true) m += 1
            }
            if (m != 0) {
                reject('bad input');
            } else {
                resolve('password is ok');
            }
        });
        return promise;
    },


    createToken: (username, userId, date, callback) => {
        //it creates new token

        const jwt = require('jsonwebtoken');
        const config = require('../config');
        const payload = {
            userId: userId,
            username: username,
            lastLogDate: date
        };
        let token = jwt.sign(payload, app.get('secret'), {
            expiresIn: config.token.tokenExpiration //seconds
        });
        callback(token);
    },


    checkToken: (token) => {
        // it controls token availability and if ok returns userId

        let promise = new Promise((resolve, reject) => {
            const jwt = require('jsonwebtoken');
            const config = require('../config');
            jwt.verify(token, config.token.tokenKey, (err, decoded) => {
                if (err) reject('bad or expired token');
                let _decoded = jwt.decode(token, { complete: true });
                const { User } = require('./data_models/_model_sequelizer');
                User.count({ where: { id: _decoded.payload.userId, lastLogDate: _decoded.payload.lastLogDate } }).then(userCount => {
                    if (userCount > 0) resolve(_decoded.payload.userId);
                    else reject('bad or expired token');
                }).catch(err => reject('bad or expired token'))
            });
        });
        return promise;
    },

}