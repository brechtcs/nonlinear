var shuffleInplace = require('fisher-yates/inplace')

class Nonlinear {
  static init (opts) {
    return new Nonlinear(opts)
  }

  constructor (opts) {
    this.opts = opts || {}
    if (!this.opts.rankTop) this.opts.rankTop = 7
  }

  logVisit (user, url) {
    var page = url.replace(/\?(.+)$/, '')
    var parts = page.split('/')
    user.logVisit(parts[1], parts[2])
  }

  listChannels (user, shuffle) {
    if (shuffle) {
      shuffleInplace(user.channels)
    }

    var top = Object.keys(user.visits).sort((a, b) => {
      if (user.visits[a] < user.visits[b]) return 1
      if (user.visits[a] > user.visits[b]) return -1
      return 0
    }).map(page => {
      var uri = page.split('/')[2]
      var match = user.channels.find(channel => channel.uri === uri)
      if (match) match.top = true
      return match
    }).filter(channel => !!channel).slice(0, this.opts.rankTop)

    return user.channels.reduce((list, channel) => {
      if (list.indexOf(channel) === -1) {
        channel.top = false
        if (channel.updated > this.cutoffDate) {
          list.push(channel)
        }
      }
      return list
    }, top).map(channel => {
      channel.visited = channel.visited || global.started
      return channel
    })
  }

  get cutoffDate () {
    var cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 1)
    return cutoff
  }
}

module.exports = Nonlinear
