"use strict"
module.exports = {
    SaveMessage: (userId, data) => {
        let promise = new Promise((resolve, reject) => {

            const { User, Conversation, Message, UserConversation } = require('../data_models/_model_sequelizer');
            if (data.reciever && data.message) {
                let date = new Date();
                Conversation.findOne({
                    include: [
                        { model: User, where: { id: userId }, through: UserConversation },
                        { model: User, where: { id: data.reciever, through: UserConversation } }
                    ]
                }).then(cData => {
                    if (cData) {
                        Message.create({
                            message: data.message,
                            date: date,
                            User: {
                                id: userId
                            },
                            Conversation: {
                                id: cData.id
                            }
                        }, { include: [User, Conversation] })
                            .then(msg => {
                                resolve(msg);
                            }).catch(err => reject());
                    } else {
                        Conversation.create({
                            User: [
                                { id: userId },
                                { id: data.reciever }
                            ]
                        }, { include: [User] }).then(_cData => {
                            Message.create({
                                message: data.message,
                                date: date,
                                User: {
                                    id: userId
                                },
                                Conversation: {
                                    id: _cData.id
                                }
                            }, { include: [User, Conversation] }).then(msg => {
                                resolve(msg);


                            }).catch(err => reject());
                        }).catch(err => reject());
                    }
                })
            } else reject();
        })
    }
}