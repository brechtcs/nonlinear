var html = require('nanohtml')
var tiles = require('./tiles')

module.exports.list = function (channels) {
  var main = html`<main class="tiles">
    ${channels.map(channel => tiles.channel(channel))}
  </main>`

  return body(main)
}

module.exports.detail = function (threads, channel) {
  var main = html`<main>
    <pre hidden>${JSON.stringify(threads, null, 2)}</pre>
    <section class="tiles">${tiles.channel(channel, 'https://twitter.com/' + channel.uri)}</section>
    ${threads.map(thread => html`<section class="tiles">
      ${thread.map(status => tiles.status(status, channel.visited))}
    </section>`)}
  </main>`

  return body(main)
}

module.exports.error = function (msg) {
  var main = html`<main>
    <pre>${msg}</pre>
  </main>`

  return body(main)
}

function body (main) {
  return html`<body>
    ${header()}
    ${main}
  </body>`
}

function header () {
  return html`<header>
    <h1><a href="/">Nonlinear</a></h1>
  </header>`
}
