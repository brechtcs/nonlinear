var MemoryStore = require('passwordless-memorystore')
var User = require('./models/user')
var bodyParser = require('body-parser')
var dedent = require('dedent')
var express = require('express')
var passwordless = require('passwordless')
var sendmail = require('email')
var serveStatic = require('serve-static')
var session = require('express-session')
var views = require('./views/server')
var {router} = require('./app')

router.impl(async function (app) {
  var port = process.env.PORT || 5003
  var server = express()
  var users = {}

  app.keep('logger', createLogger())

  server.enable('trust proxy')
  server.use(serveStatic('assets'))
  server.use(bodyParser.urlencoded({extended: false}))
  server.use(session({
    maxAge: 2 * 24 * 60 * 60 * 1000,
    secret: 'blah',
    saveUninitialized: false,
    resave: false
  }))

  passwordless.init(new MemoryStore(), {allowTokenReuse: true})
  passwordless.addDelivery(sendTokenByMail)

  server.use(passwordless.sessionSupport())
  server.use(passwordless.acceptToken({successRedirect: '/'}))

  server.get('/login', function (req, res) {
    createViewMethod(res)(views.login())
  })

  server.post('/login', passwordless.requestToken(async function (email, delivery, cb, req) {
    try {
      var user = await User.load(email)
      users[email] = user
      req.session.user = email
      cb(null, user.id)
    } catch (err) {
      app.logger.warn(err)
      cb(null, null)
    }
  }), function (req, res) {
    createViewMethod(res)('<body>Sent!</body>')
  })

  server.use(passwordless.restricted({failureRedirect: '/login'}))

  server.use((req, res) => {
    app.clean()

    app.set('view', createViewMethod(res))
    app.state.data = req.body
    app.state.method = req.method
    app.state.url = req.url
    app.state.user = users[req.session.user]

    app.match(req.url)
  })

  server.listen(port, (err) => {
    if (err) throw err
    else app.logger.info('Listening at localhost:' + port)
  })
})

function createViewMethod (res) {
  var wrapView = function (body) {
    return `
            <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
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

function sendTokenByMail (token, uid, recipient, cb, req) {
  var msg = dedent`
    Hello human,

    Login to ${req.protocol}://${req.headers.host}?token=${token}&uid=${encodeURIComponent(uid)}

    Cheers,

    Nonlinear
  `

  if (true) {
    var mail = new sendmail.Email({
      from:  'no-reply@nonlinear.yarf.xyz',
      to: recipient,
      subject: 'Nonlinear login',
      body: msg
    })
    mail.send()
  }
  console.log(msg)
  cb()
}
