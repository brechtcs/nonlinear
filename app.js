var Nonlinear = require('./models/nonlinear')
var Router = require('abstract-router')
var views = require('./views')

var nonlinear = Nonlinear.init()
var router = Router.create()

router.on('/', function (state, app) {
  var channels = nonlinear.listChannels()
  app.view(views.list(channels))
})

router.on('/twitter/:channel', async function (state, app) {
  nonlinear.logVisit(state.url)

  try {
    var channel = nonlinear.channels.find(channel => channel.uri === state.params.channel)
    var detail = await nonlinear.twitter.detail(channel || state.params.channel)
    app.view(views.detail(detail.threads, detail.channel))
  } catch (err) {
    app.logger.error(err)
    app.view(views.error('Server error'), 500)
  }
})

module.exports.nonlinear = nonlinear
module.exports.router = router
