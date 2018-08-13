var AtomicFile = require('atomic-file')
var Twitter = require('./twitter')
var shuffle = require('fisher-yates/inplace')

class Nonlinear {
  static async start (file, opts) {
    var storage = new AtomicFile(file)
    var nonlinear = new Nonlinear(storage, opts)

    if (opts.accounts) {
      nonlinear.twitter = await Twitter.init(opts.accounts.twitter)
    }

    return new Promise((resolve, reject) => {
      storage.get((err, log) => {
        if (!err) nonlinear.log = log
        resolve(nonlinear)
      })
    })
  }

  constructor (storage, opts) {
    this.log = {}
    this.opts = opts || {}
    this.storage = storage
    this.start = Date.now()

    if (!this.opts.rankTop) this.opts.rankTop = 12
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
      channel.visited = visited || this.start
      return channel
    })
  }

  get channels () {
    return this.twitter.channels
  }
}

module.exports = Nonlinear
