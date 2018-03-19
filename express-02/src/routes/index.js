let express = require('express')
let router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html.njk', { title: 'Your "default" page | Express app' })
})

module.exports = router