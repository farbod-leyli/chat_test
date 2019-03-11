"use strict"
module.exports = {
    GetMessages: (userId, data) => {
        let promise = new Promise((resolve, reject) => {
            const { User, Conversation, Message, UserConversation, Seen } = require('../data_models/_model_sequelizer');
            //we need to find all conversations of this user and last message of each one
            if (data.lastDate && data.conversation) {
                Conversation.findById(//check is user in this conversation?
                    { id: data.conversation },
                    {
                        include: [
                            {
                                model: User,
                                as: 'authors',
                                through: UserConversation
                            }
                        ]
                    }).then(cData => {
                        let userArray = []

                        for (i = 0; i < cData.authors.length; i++) {
                            userArray.push(cData.authors[i].id);
                        }

                        if (userArray.indexOf(userId) != -1) {
                            let otherUserId = userArray[(userArray.indexOf(userId) == 0) ? 1 : 0]

                            Message.findAll(//finding latest 50 messages for this conversation before date
                                {
                                    where: { date: { $lt: data.lastDate } }
                                },
                                {
                                    include: [
                                        {
                                            model: Conversation,
                                            where: { id: data.conversation }
                                        },
                                        User
                                    ]
                                }, { limit: 50, order: [['updatedAt', 'DESC']] }
                            ).then(_data => {
                                Seen.upsert({
                                    lastSeenDate: data,
                                    User: {
                                        id: userId
                                    },
                                    Conversation: {
                                        id: data.conversation
                                    }
                                }, { include: [User, Conversation] });
                                
                                Seen.findOne({
                                    include: [
                                        {
                                            model: User,
                                            where: { id: otherUserId }
                                        }
                                    ]
                                }).then(seen => {
                                    let result = { conversation: data.conversation, messages: _data, lastSeen: seen }
                                    resolve(result)
                                })
                            });
                        } else reject();
                    })
            } else reject();
        });
        return promise;
    }
}