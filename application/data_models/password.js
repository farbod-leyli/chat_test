"use strict"
module.exports = {
    PasswordModel: (type) => {
        const attributes = {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            password: type.STRING
        }
        return attributes;
    }
}