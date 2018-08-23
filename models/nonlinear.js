var AtomicFile = require('atomic-file')
var Twitter = require('./twitter')
var shuffle = require('fisher-yates/inplace')

class Nonlinear {
  static init (opts) {
    return new Nonlinear(opts)
  }

  constructor (opts) {
    this.log = {}
    this.opts = opts || {}
    this.started = Date.now()

    if (!this.opts.rankTop) this.opts.rankTop = 7
  }

  async start (file, accounts) {
    this.storage = new AtomicFile(file)

    if (accounts) {
      this.twitter = await Twitter.init(accounts.twitter)
    }

    return new Promise((resolve, reject) => {
      this.storage.get((err, log) => {
        if (!err) this.log = log
        resolve()
      })
    })
  }

  logVisit (url) {
    var page = url.replace(/\?(.+)$/, '')
    var time = Date.now()
    this.log[page] = time
    this.storage.set(this.log, err => {
      if (err) console.warn(err)
    })
  }

  listChannels () {
    shuffle(this.channels)

    var top = Object.keys(this.log).sort((a, b) => {
      if (this.log[a] < this.log[b]) return 1
      if (this.log[a] > this.log[b]) return -1
      return 0
    }).map(page => {
      var uri = page.split('/')[2]
      var match = this.channels.find(channel => channel.uri === uri)
      return match
    }).filter(channel => !!channel).slice(0, this.opts.rankTop)

    return this.channels.reduce((list, channel) => {
      if (list.indexOf(channel) === -1) list.push(channel)
      return list
    }, top).map(channel => {
      var visited = this.log[`/${channel.medium}/${channel.uri}`]
      channel.visited = visited || this.started
      return channel
    })
  }

  get channels () {
    return this.twitter.channels
  }
}

module.exports = Nonlinear
