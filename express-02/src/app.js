import express        from "express"
import path           from "path"
import favicon        from "serve-favicon"
import logger         from "morgan"
import cookieParser   from "cookie-parser"
import bodyParser     from "body-parser"
import sassMiddleware from "node-sass-middleware"
import nunjucks       from "nunjucks"

let app = express();

// Nunjucks view engine setup
// https://mozilla.github.io/nunjucks/getting-started.html
// https://mozilla.github.io/nunjucks/api.html#configure
nunjucks.configure("views", {
  autoescape: true,
  // TODO: install dep. "chokidar" for watch/autoreload ability.
  //watch: true,
  // ^ meanwhile we disabled caching for dev. purposes.
  noCache: true,
  express: app
});
app.set("view engine", "nunjucks");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, "public"),
  dest: path.join(__dirname, "public"),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, "public")));

let index = require("./routes/index");
let users = require("./routes/users");
let pgsql = require("./routes/pgsql");
let phantompdf = require("./routes/phantom-pdf");

app.use("/", index);
app.use("/users", users);
app.use("/pg", pgsql);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
