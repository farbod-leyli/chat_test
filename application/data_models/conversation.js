"use strict"
module.exports = {
    ConversationModel: (type) => {
        const attributes = {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            }
        }
        return attributes;
    }
}