const Chatroom = require('./Chatroom')
const locationTemplates = require('./config/Locations')

module.exports = function () {
  // mapping of all available locations
  const locations = new Map(
    locationTemplates.map(c => [
      c.name,
      Chatroom(c)
    ])
  )
  function getLocationByName(locationName) {
    return locations.get(locationName)
  }

  function serializeLocation() {
    return Array.from(locations.values()).map(c => c.serialize())
  }

  function removeClientLocations(client) {
    locations.forEach(c => c.removeUser(client))
  }
  
  return {
    getLocationByName,
    serializeLocation,
    removeClientLocations
  }
}