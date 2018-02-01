let express = require('express');
let router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("phantom-pdf/index.html.njk", { title: "Phantom PDF export" });
});

module.exports = router;
