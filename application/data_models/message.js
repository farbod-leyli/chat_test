"use strict"
module.exports = {
    MessageModel: (type) => {
        const attributes = {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            message: type.STRING,
            date: type.DATE
        }
        return attributes;
    }
}