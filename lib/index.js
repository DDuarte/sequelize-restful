var Router  = require('./router')
  , connect = require('connect')

module.exports = function(sequelize, options) {
  var router = new Router(sequelize, options)

  return function(req, res, next) {
    if (router.isRestfulRequest(req.path)) {
      connect.bodyParser()(req, res, function() {
        router.handleRequest(req, function(result, options) {
          options = options || {}

          // FIXME: awful hack to remove the flag property from unsolved api/Challenges (juice-shop)
          if (result.hasOwnProperty('data') && result.data.hasOwnProperty('length')) {
            for (var i = 0; i < result.data.length; ++i) {
              if (result.data[i].hasOwnProperty('solved') && result.data[i].hasOwnProperty('flag')) {
                if (!result.data[i].solved) {
                  delete result.data[i].flag;
                }
              }
            }
          }

          if (options.viaHeaders) {
            res.header('Sequelize-Admin', JSON.stringify(result))
            res.send()
          } else {
            res.json(result)
          }
        })
      })
    } else {
      next()
    }
  }
}
