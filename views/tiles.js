var html = require('nanohtml')
var moment = require('moment')
var raw = require('nanohtml/raw')

module.exports.channel = function (channel, link) {
  link = link || `/twitter/${channel.uri}`

  var content = html`<div>
        <h2><a href=${link}>${channel.name}</a></h2>
        <p>${raw(channel.description)}</p>
    </div>`

  return tile(channel, content, channel.updated > channel.visited)
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

  return tile(channel, content, status.updated > visited)
}

function tile (channel, content, highlight) {
  return html`<div class="tile" style="opacity:${highlight ? 1 : 0.62}">
        <img src=${channel.avatar}>
        ${content}
    </div>`
}

function date (timestamp) {
  return html`<time>
        ${moment(timestamp).format('D MMMM YYYY, H:mm')}
    </time>`
}
