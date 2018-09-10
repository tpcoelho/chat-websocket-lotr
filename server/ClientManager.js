const heroTemplates = require('./config/Heroes')

module.exports = function () {
  // mapping of all connected clients
  const clients = new Map()

  function addClient(client) {
    clients.set(client.id, { client })
  }

  function registerClientHero(client, hero) {
    clients.set(client.id, { client, hero })
  }

  function removeClientHero(client) {
    clients.delete(client.id)
  }

  function getAvailableHero() {
    const heroesTaken = new Set(
      Array.from(clients.values())
        .filter(c => c.hero)
        .map(c => c.hero.name)
    )
    return heroTemplates
      .filter(hero => !heroesTaken.has(hero.name))
  }

  function isHeroAvailable(heroName) {
    return getAvailableHero().some(hero => hero.name === heroName)
  }

  function getHeroByName(heroName) {
    return heroTemplates.find(hero => hero.name === heroName)
  }

  function getHeroByClientId(clientId) {
    return (clients.get(clientId) || {}).hero
  }

  return {
    addClient,
    registerClientHero,
    removeClientHero,
    getAvailableHero,
    isHeroAvailable,
    getHeroByName,
    getHeroByClientId
  }
}