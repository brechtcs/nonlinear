var Nonlinear = require('./models/nonlinear')
var Router = require('abstract-router')
var views = require('./views')

var nonlinear = Nonlinear.init()
var router = Router.create()

router.on('/', function (state, app) {
  var channels = nonlinear.listChannels(state.user)
  app.view(views.list(channels))
})

router.on('/twitter/:channel', async function (state, app) {
  try {
    var user = state.user
    var channel = user.channels.find(channel => channel.uri === state.params.channel)
    var detail = await user.twitter.detail(channel || state.params.channel)
    app.view(views.detail(detail.threads, detail.channel))
    nonlinear.logVisit(state.user, state.url)
  } catch (err) {
    app.logger.error(err)
    app.view(views.error('Server error'), 500)
  }
})
module.exports.router = router
