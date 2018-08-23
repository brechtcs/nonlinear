var Channel = require('./channel')
var Lru = require('lru')
var Status = require('./status')
var Twit = require('twit')

class Twitter {
  static async init (account) {
    var twitter = new Twitter(account)
    var data = await twitter.get('friends/ids', {stringify_ids: true})
    var stream = twitter.api.stream('statuses/filter', {follow: data.ids})
    stream.on('tweet', tweet => {
      var channel = twitter.channels.find(channel => channel.id === tweet.user.id_str)
      if (channel) channel.updated = tweet.created_at
    })
    await twitter.follow(data.ids)

    return twitter
  }

  constructor (account) {
    this.channels = []

    this.api = new Twit(account)
    this.cache = new Lru(5000)
  }

  get (endpoint, opts) {
    if (!opts) opts = {}
    if (!opts.tweet_mode) opts.tweet_mode = 'extended'

    return new Promise((resolve, reject) => {
      this.api.get(endpoint, opts, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async follow (ids) {
    if (!Array.isArray(ids)) ids = [ids]
    if (!ids.length) return

    var batch = ids.splice(0, 100)
    var users = await this.get('users/lookup', {user_id: batch})
    var channels = users.map(user => Channel.from('twitter', user))
    this.channels = this.channels.concat(channels)
    await this.follow(ids)
  }

  async detail (channel) {
    var req = {}
    if (typeof channel === 'string') {
      req.screen_name = channel
    } else if (typeof channel === 'object') {
      req.user_id = channel.id
    }

    var tweets = await this.get('statuses/user_timeline', req)
    var statuses = tweets.map(tweet => Status.from('twitter', tweet))
    statuses.forEach(status => this.cache.set(status.id, status))
    channel = typeof channel === 'object' ? channel : statuses[0].channel

    var threads = Object.values(await this.group(statuses, {}))
    return {channel, threads}
  }

  async group (statuses, threads) {
    if (!statuses.length) return threads
    var status = statuses.pop()

    if (!status.parent) {
      threads[status.id] = [status]
      return this.group(statuses, threads)
    }

    if (threads[status.parent]) {
      threads[status.id] = threads[status.parent]
      threads[status.id].push(status)
      delete threads[status.parent]
    } else {
      threads[status.id] = await this.thread(status.parent, [status])
    }

    return this.group(statuses, threads)
  }

  async thread (id, thread) {
    try {
      var status = this.cache.get(id)
      if (!status) {
        var tweet = await this.get('statuses/show/:id', {id})
        status = Status.from('twitter', tweet)
        this.cache.set(status.id, status)
      }
      thread.push(status)

      if (status.parent) {
        return await this.thread(status.parent, thread)
      }
      return thread.reverse()
    } catch (e) {
      console.warn(id, e.message)
      return thread.reverse()
    }
  }
}

module.exports = Twitter
