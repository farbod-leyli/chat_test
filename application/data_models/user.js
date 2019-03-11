"use strict"
module.exports = {
    UserModel: (type) => {
        const attributes = {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: type.STRING,
            lastLoginDate: type.DATE
        }
        return attributes;
    }
}