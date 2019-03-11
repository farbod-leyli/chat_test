"use strict"
const config = require('../../config');

const Sequelize = require('sequelize');
const { UserModel } = require('./user');
const { MessageModel } = require('./message');
const { ConversationModel } = require('./conversation');
const { SeenModel } = require('./seen');
const { PasswordModel } = require('./password');

const sequelize = new Sequelize(
  config.dbConfig.sequelize,
  config.dbConfig.user,
  config.dbConfig.password,
  config.dbConfig.config
);

const User = sequelize.define('user', UserModel(Sequelize));
const Conversation = sequelize.define('conversation', ConversationModel(Sequelize));
const Message = sequelize.define('message', MessageModel(Sequelize));
// UserConversation will be our way of tracking relationship between User and Conversation models
// each User can have multiple Conversation and each Conversation can have multiple User
const UserConversation = sequelize.define('user_conversation', {});
const Seen = sequelize.define('seen', SeenModel(Sequelize));
const Password = sequelize.define('password', PasswordModel(Sequelize));

User.belongsToMany(Conversation, { through: UserConversation, unique: false });
Conversation.belongsToMany(User, { through: UserConversation, unique: false });
Message.belongsTo(Conversation);
Message.belongsTo(User);//composer
Seen.belongsTo(User);
Seen.belongsTo(Conversation);
Password.hasOne(User);


sequelize.sync({ force: true })
  .then(() => {
    console.log('Database and tables created!');
  });

module.exports = {
  User,
  Conversation,
  UserConversation,
  Message,
  Password,
  Seen
}