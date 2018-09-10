const express = require("express");
const app = express();
const socketIO = require('socket.io')

const ClientManager = require('./ClientManager')
const ChatroomManager = require('./ChatroomManager')
const makeHandlers = require('./handlers')

//Listen on port 4000
var port = 4000;
server = app.listen(port)

//socket.io init
const io = socketIO(server)

const clientManager = ClientManager()
const chatroomManager = ChatroomManager()

io.on('connection', function (client) {
  const {
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetLocations,
    handleLockHero,
    handleGetAvailableHero,
    handleDisconnect
  } = makeHandlers(client, clientManager, chatroomManager)

  console.log('client connected...', client.id)

  clientManager.addClient(client)

  // Chatroom functions

  client.on('join', handleJoin)

  client.on('leave', handleLeave)

  client.on('message', handleMessage)
  
  client.on('location', handleGetLocations)

  client.on('lockHero', handleLockHero)

  client.on('availableHero', handleGetAvailableHero)

  // END Chatroom functions

  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
    handleDisconnect()
  })

  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
});

server.listen(app.get('port'), function (err) {
  console.log(`Server is running on port ${port}`);

})