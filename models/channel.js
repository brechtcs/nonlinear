var assert = require('nanoassert')

class Channel {
  static from (medium, data) {
    return new Channel(medium, data)
  }

  constructor (medium, data) {
    this.medium = medium
    this.data = data

    if (this.data.status) {
      this.updated = this.data.status.created_at
      delete this.data.status
    }
  }

  get id () {
    return this.data.id_str
  }

  set id (_) {
    throw new Error('Channel property `id` is read-only')
  }

  get avatar () {
    return this.data.profile_image_url_https
  }

  set avatar (_) {
    throw new Error('Channel property `avatar` is read-only')
  }

  get description () {
    return this.data.description.replace(/\n/g, '<br>')
  }

  set description (_) {
    throw new Error('Channel property `description` is read-only')
  }

  get name () {
    return this.data.name
  }

  set name (_) {
    throw new Error('Channel property `name` is read-only')
  }

  get uri () {
    return this.data.screen_name
  }

  set uri (_) {
    throw new Error('Channel property `uri` is read-only')
  }

  get updated () {
    return this._updated
  }

  set updated (date) {
    this._updated = new Date(date || null)
  }

  get visited () {
    return this._visited
  }

  set visited (visit) {
    this._visited = new Date(visit || global.started)
  }

  get watching () {
    return this._watching
  }

  set watching (watching) {
    assert(typeof watching === 'boolean', '`channel.watching` should be boolean')
    this._watching = watching
  }
}

module.exports = Channel
