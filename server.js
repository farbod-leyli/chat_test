"use strict"

//---------tools
const express = require('express');
const config = require('./config');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const unCapitalize = require('express-uncapitalize');
const slash = require('express-slash');
const app = express();
app.enable('strict routing');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(unCapitalize());
const port = process.env.PORT || config.serverPort;
const server = app.listen(port);

const Controller = require('./application/controller');



//---------Database
const { User, Conversation, UserConversation, Message, Password, Seen } = require('./application/data_models/_model_sequelizer');
//Here we used Sequelize ORM to have better library, Promises, tools and documents for using mySql on nodeJS.
//By using this tool we can modelize data and relations for mySql very similar to mongoose on mongoDB.
//There is no need here for this line of code.
//Sequelize will check the database availabilty and creates tables and relations between records
//in the module that we called here.
//Database configuration details are available to change in ./config.js


const redis = require('redis');
var socketClient = redis.createClient({
    port: config.redisConfig.socketPort,
    host: config.redisConfig.host,
    password: config.redisConfig.password
}); //userId: socketId

var chatClient = redis.createClient({
    port: config.redisConfig.chatPort,
    host: config.redisConfig.host,
    password: config.redisConfig.password
}); //userId: conversationId

//We create two redis client to have good performance on sockets.
//socketClient is for finding destination clients and emit messages to them.
//chatClient helps us to know if destination client is on a certain conversation,
//we emit incoming messages to that conversation emmediately.




//---------Testing server
app.get('/', (req, res) => {
    res.send('Server is running...');
});
app.listen(port);
console.log('Server is up at http//localhost:' + port);




//---------socket
const io = require('socket.io').listen(server);
const jwt = require('jsonwebtoken');
//Socket connections will be available on the same port (8080) as Routes.

const { GetList } = require('./application/socket/getList');
const { GetMessages } = require('./application/socket/getMessage');
const { SaveMessage } = require('./application/socket/saveMessage');

io
    .use((socket, next) => {
        //authentication by token
        if (socket.handshake.query && socket.handshake.query.token) {
            let token = socket.handshake.query.token;
            Controller.checkToken(token).then(() => {
                next();
            }).catch(err => {
                next(new Error('Authentication error'));
            })
        } else {
            next(new Error('Authentication error'));
        }
    })
    .on('connection', socket => {
        Controller.checkToken(socket.handshake.query.token).then(userId => {

            socketClient.set(userId, socket.id);
            //We added client's userId and socketId to socketClient on Redis, now we can emit data directly to that.
            //On every connection we should emit conversations list to client.

            //On .Disconect we should delete all socket data from redis client. here we set a pair record to find each one easily.
            socketClient.set(socket.id, userId);

            //We emit user's own conversations list directly by using its socketId.
            GetList(userId).then(list => {
                io.sockets.sockets[socket.id].emit(list);
            });

        });

        socket
            .on('conversation', data => {
                //emit 50 latest messages sorting by date before the last message's date
                //update the lastSeenDate for conversation and user to show seen messages to other.

                // data: {
                //     lastDate: Date,
                //     conversation: id,
                //     getInside: Boolean
                // }
                Controller.checkToken(socket.handshake.query.token).then(userId => {
                    if (!data.getInside) {//when user closes a conversation
                        chatClient.set(userId, false);

                    } else {//when user opens a conversation
                        chatClient.set(userId, 600, data.conversation);
                        Controller.checkToken(socket.handshake.query.token).then(userId => {
                            GetMessages(userId, data).then(list => {
                                io.sockets.sockets[socket.id].emit(list);

                            });
                        });
                    }
                });
            })
            .on('message', data => {
                //get data -> save message in db ->  find conversation -> find other client userId
                //-> search in socketClient -> if is online emit message

                // data: {
                //     reciever: userId,
                //     message: text
                // }
                Controller.checkToken(socket.handshake.query.token).then(userId => {
                    SaveMessage(userId, data).then(message => {
                        io.sockets.sockets[socket.id].emit({ message: message.id, sent: true });
                        socketClient.get(data.reciever, _socketId => {
                            if (_socketId) io.sockets.sockets[_socketId].emit(message);
                        });
                    })
                });
            })
            .on('typing', data => {
                //get data -> find conversation -> find other client userId -> search in socketClient -> if is online emit data


                // data: {
                //     reciever: id,
                //     typing: Boolean
                // }
                //This data will get recieved from one of clients on a conversation
                //and we should send it to other one if is online.

                Controller.checkToken(socket.handshake.query.token).then(userId => {

                    chatClient.get(data.reciever, _converatinId => {
                        if (_converatinId) {

                            socketClient.get(data.reciever, _socketId => {
                                let _data = {
                                    conversation: _converatinId,
                                    userId: userId,
                                    typing: data.typing
                                }
                                io.sockets.sockets[_socketId].emit(_data);
                            })
                        }
                    })
                });
            })
    })
    .on('disconnect', socket => {
        //delete from Redis client
        socketClient.get(socket.id, (err, userId) => {
            if (err) throw err;
            socketClient.del(socket.id);
            socketClient.del(userId);
            chatClient.del(userId);
        });
        //**better to handle as Promise */
    });




//---------Router api
const Router = express.Router({
    caseSensitive: app.get('case sensitive routing'),
    strict: app.get('strict routing')
});
app.use(slash());

//Send a correct body.username to get userId
const { FindUser } = require('./application/router/finduser');
Router.post('/find', FindUser);


//These routes are for SignUp as new users and Login as new sessions:
const { Signup } = require('./application/router/signup');
Router.post('/signup', SignUp);

const { Login } = require('./application/router/login');
Router.post('/login', Login);



//In both Routes we have same requests:
// req.body: {
//     username: 'user input',
//     password: 'user input'
// }
// res: [{ token: 'token for authenticating client on socket' }]
//Client should save this token on its storage and send it in Headers of requests for secured routes,
//or in handshake.query.token on socket connection.

app.use('/', Router);




//---------Router html
//For visual test; Not ready yet...