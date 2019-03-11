module.exports = {
    serverPort: 8080,
    dbConfig: {
        user: '',
        password: '',
        database: 'chat_db',
        config: {
            host: 'localhost',
            dialect: 'mysql',
            port: 3000,
            operatorsAliases: false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    },
    redisConfig: {
        socketPort: 3010,
        chatPort: 3011,
        host: 'localhost',
        password: ''
    },
    token: {
        tokenKey: 'bh68kl48y98t8y4k68u4',
        tokenExpiration: 72 * 60 * 60//in seconds
    }

}