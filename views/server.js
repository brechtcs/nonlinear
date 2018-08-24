var html = require('nanohtml')

module.exports.login = function () {
  return html`<body>
    <form method="POST">
      <input type="email" name="user">
      <input type="submit" value="Login">
    </form>
  </body>`
}
