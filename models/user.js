var AtomicFile = require('atomic-file')
var Channel = require('./channel')
var Twitter = require('./twitter')

class User {
  static load (email) {
    var user = new User({email})

    return new Promise((resolve, reject) => {
      user.storage.get(async (err, data) => {
        if (err) return reject(err)
        if (!data.visits) data.visits = {}
        user.data = data
        await user.connect(data.accounts)
        resolve(user)
      })
    })
  }

  constructor (data, channels) {
    this.channels = channels || []
    this.data = data
    this.storage = new AtomicFile(`./data/${data.email}.json`)

    if (data.accounts && data.accounts.twitter) {
      this.twitter = Twitter.init(data.accounts.twitter, channels)
    }
  }

  async connect (accounts) {
    if (accounts.twitter) {
      this.twitter = Twitter.init(accounts.twitter)
      this.channels = await this.twitter.load()
    }

    this.channels.forEach(channel => {
      channel.visited = this.visits[`/${channel.medium}/${channel.uri}`]
    })
  }

  async save () {
    this.storage.set(this.data, err => {
      if (err) console.warn(err)
    })
  }

  logVisit (medium, uri) {
    var time = Date.now()
    var channel = this.channels.find(channel => channel.medium === medium && channel.uri == uri)
    if (channel) channel.visited = time
    this.visits[`/${medium}/${uri}`] = time
    this.save()
  }

  get id () {
    return this.data.id
  }

  get visits () {
    return this.data.visits
  }
}

module.exports = User
