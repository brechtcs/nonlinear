var Channel = require('./channel')

class Status {
  static from (medium, data) {
    return new Status(medium, data)
  }

  constructor (medium, data) {
    this.medium = medium
    this.data = data

    if (!this.original.entities.media) {
      this.original.entities.media = []
    }
  }

  get id () {
    return this.data.id_str
  }

  set id (_) {
    throw new Error('Status property `id` is read-only')
  }

  get channel () {
    return Channel.from(this.medium, this.original.user)
  }

  set channel (_) {
    throw new Error('Status property `channel` is read-only')
  }

  get content () {
    var content = this.original.full_text
    this.original.entities.urls.forEach(url => {
      content = content.replace(url.url, `<a href=${url.expanded_url}>${url.display_url}</a>`)
    })
    this.original.entities.media.forEach(media => {
      content = content.replace(media.url, `<a href=${media.media_url_https}>${media.display_url}</a>`)
    })
    return content.replace(/\n/g, '<br>')
  }

  set content (_) {
    throw new Error('Status property `content` is read-only')
  }

  get original () {
    return this.data.retweeted_status || this.data
  }

  set original (_) {
    throw new Error('Status property `original` is read-only')
  }

  get parent () {
    return this.data.in_reply_to_status_id_str || this.data.quoted_status_id_str
  }

  set parent (_) {
    throw new Error('Status property `parent` is read-only')
  }

  get timestamp () {
    return new Date(this.original.created_at)
  }

  set timestamp (_) {
    throw new Error('Status property `timestamp` is read-only')
  }

  get updated () {
    return new Date(this.data.created_at)
  }

  set updated (_) {
    throw new Error('Status property `update` is read-only')
  }
}

module.exports = Status
