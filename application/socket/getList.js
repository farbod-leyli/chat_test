"use strict"
module.exports = {
    GetList: (userId) => {
        let promise = new Promise((resolve, reject) => {
            const { User, Conversation, Message, UserConversation } = require('../data_models/_model_sequelizer');
            //we need to find all conversations of this user and last message of each one
            Conversation.findAll({
                include: [
                    {
                        model: User,
                        as: 'authors',
                        through: {
                            model: UserConversation,
                            where: { id: userId }
                        }
                    },
                    Message
                ]
            }).then(data => resolve(data)).catch(err => reject());
        });
        return promise;
    }
}