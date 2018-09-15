var html = require('nanohtml')
var moment = require('moment')
var raw = require('nanohtml/raw')

module.exports.channel = function (channel, link) {
  link = link || `/twitter/${channel.uri}`

  var content = html`<div>
    <h2><a href=${link}>${channel.name}</a></h2>
    <p>${raw(channel.description)}</p>
    <form method="POST">
      <select name="action">${getChannelActions(channel)}</select>
      <input type="hidden" name="id" value=${channel.id}>
      <input type="submit" value="confirm">
    </form>
  </div>`

  var effect = channel.watching ? 'shine' : 'twinkle'
  if (channel.updated < channel.visited) {
    effect += ' dimmed'
  }
  return tile(channel, content, channel.top, effect)
}

module.exports.status = function (status, visited) {
  var channel = status.channel
  var content = html`<div>
    <h2><a href="/twitter/${channel.uri}">${channel.name}</a></h2>
    <a href="https://twitter.com/${channel.uri}/status/${status.id}">
      ${date(status.timestamp)}
    </a>
    <p>${raw(status.content)}</p>
  </div>`

  return tile(channel, content, false, status.updated < visited && 'dimmed')
}

function tile (channel, content, top, effect) {
  return html`<div class="tile${top ? ' tile-top' : ''} ${effect ? effect : ''}">
    <img src=${channel.avatar} class="avatar">
    ${content}
  </div>`
}

function date (timestamp) {
  return html`<time>
    ${moment(timestamp).format('D MMMM YYYY, H:mm')}
  </time>`
}

function getChannelActions (channel) {
  var options = []

  if (channel.watching) {
    return html`<option value="channel-unwatch">unwatch</option>`
  } else {
    return html`<option value="channel-watch">watch</option>`
  }
  return options
}
