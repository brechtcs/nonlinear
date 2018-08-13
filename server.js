var ecstatic = require('ecstatic')
var express = require('express')

module.exports = function (app) {
  var port = process.env.PORT || 5003
  var server = express()

  app.keep('logger', createLogger())

  server.use(ecstatic({
    root: `${__dirname}/assets`,
    showdir: false
  }))

  server.use((req, res) => {
    app.clean()

    app.set('view', createViewMethod(res))
    app.state.method = req.method
    app.state.url = req.url

    app.match(req.url)
  })

  server.listen(port, (err) => {
    if (err) throw err
    else app.props.logger.info('Listening at localhost:' + port)
  })
}

function createViewMethod (res) {
  var wrapView = function (body) {
    return `
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Nonlinear</title>

                    <link rel="stylesheet" href="/style.css">
                </head>
                ${body}
            </html>
        `
  }

  return function (body, status) {
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(status || 200)
    res.end(wrapView(body))
  }
}

function createLogger () {
  return {
    error: console.error,
    info: console.info,
    warn: console.warn
  }
}
