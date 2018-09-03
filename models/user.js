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
      var visited = this.visits[`/${channel.medium}/${channel.uri}`]
      channel.visited = visited
      channel.watching = !!visited
    })
  }

  async save () {
    this.storage.set(this.data, err => {
      if (err) console.warn(err)
    })
  }

  findChannel (id) {
    var channel = this.channels.find(channel => channel.id === id)
    if (!channel) {
      throw new Error('Channel not found')
    }
    return channel
  }

  handleAction (data) {
    switch (data.action) {
      case 'channel-unwatch':
        return this.unwatchChannel(data.id)
      case 'channel-watch':
        return this.watchChannel(data.id)
      default:
        console.error("No such action:", data.action)
    }
  }

  logVisit (medium, uri, time) {
    time = time || Date.now()

    var channel = this.channels.find(channel => channel.medium === medium && channel.uri == uri)
    if (channel) {
      channel.visited = time
      if (!channel.watching) return
      this.visits[`/${medium}/${uri}`] = time
      this.save()
    }
  }

  watchChannel (id) {
    try {
      var channel = this.findChannel(id)
      channel.watching = true
      this.visits[`/${channel.medium}/${channel.uri}`] = 0
      this.save()
    } catch (err) {
      console.error(err)
    }
  }

  unwatchChannel (id) {
    try {
      var channel = this.findChannel(id)
      channel.watching = false
      delete this.visits[`/${channel.medium}/${channel.uri}`]
      this.save()
    } catch (err) {
      console.error(err)
    }
  }

  get id () {
    return this.data.id
  }

  get visits () {
    return this.data.visits
  }
}

module.exports = User
