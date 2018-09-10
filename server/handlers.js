function makeHandleEvent(client, clientManager, chatroomManager) {
  function ensureExists(getter, rejectionMessage) {
    return new Promise(function (resolve, reject) {
      const res = getter()
      return res
        ? resolve(res)
        : reject(rejectionMessage)
    })
  }

  function ensureUserSelected(clientId) {
    return ensureExists(
      () => clientManager.getHeroByClientId(clientId),
      'select user first'
    )
  }

  function ensureValidChatroom(locationName) {
    return ensureExists(
      () => chatroomManager.getLocationByName(locationName),
      `invalid chatroom name: ${locationName}`
    )
  }

  function ensureValidChatroomAndUserSelected(locationName) {
    return Promise.all([
      ensureValidChatroom(locationName),
      ensureUserSelected(client.id)
    ])
      .then(([chatroom, user]) => Promise.resolve({ chatroom, user }))
  }

  function handleEvent(locationName, createEntry) {
    return ensureValidChatroomAndUserSelected(locationName)
      .then(function ({ chatroom, user }) {

        // append event to chat history
        const entry = { user, ...createEntry() }
        chatroom.addEntry(entry)

        // notify other clients in chatroom
        chatroom.broadcastMessage({ chat: locationName, ...entry })

        return chatroom
      })
  }

  return handleEvent
}

module.exports = function (client, clientManager, chatroomManager) {
  const handleEvent = makeHandleEvent(client, clientManager, chatroomManager)

  function handleJoin(locationName, callback) {
    const createEntry = () => ({ event: `Arrived in  ${locationName}` })
    handleEvent(locationName, createEntry)
    .then(function (chatroom) {
        // add member to chatroom
        chatroom.addUser(client)

        // send chat history to client
        callback(null, chatroom.getChatHistory())
      })
      .catch(callback)
  }

  function handleLeave(locationName, callback) {
    const createEntry = () => ({ event: `left of ${locationName}` })

    handleEvent(locationName, createEntry)
      .then(function (chatroom) {
        // remove member from chatroom
        chatroom.removeUser(client.id)

        callback(null)
      })
      .catch(callback)
  }

  function handleMessage({ locationName, message } = {}, callback) {
    const createEntry = () => ({ message })

    handleEvent(locationName, createEntry)
      .then(() => callback(null))
      .catch(callback)
  }

  function handleGetLocations(_, callback) {
    return callback(null, chatroomManager.serializeLocation())
  }

  function handleLockHero(heroName, callback) {
    if (!clientManager.isHeroAvailable(heroName)){
      return callback('Hero is not available')
    }

    const hero = clientManager.getHeroByName(heroName)
    clientManager.registerClientHero(client, hero)

    return callback(null, hero)
  }

  function handleGetAvailableHero(_, callback) {
    return callback(null, clientManager.getAvailableHero())
  }

  function handleDisconnect() {
    // remove user profile
    clientManager.removeClientHero(client)
    // remove member from all chatrooms
    chatroomManager.removeClientLocations(client)
  }

  return {
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetLocations,
    handleLockHero,
    handleGetAvailableHero,
    handleDisconnect
  }
}