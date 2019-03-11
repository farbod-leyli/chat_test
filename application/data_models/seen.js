"use strict"
module.exports = {
    SeenModel: (type) => {
        const attributes = {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            lastSeenDate: type.DATE
        }
        return attributes;
    }
}