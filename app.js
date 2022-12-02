const fs = require('fs'),
  path = require('path'),
  logger = require('morgan'),
  moment = require('moment'),
  express = require('express'),
  flash = require('connect-flash'),
  session = require('express-session'),
  createError = require('http-errors'),
  cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 6543;
app.locals.moment = moment;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: 'manekTech_Interview',
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(flash());

app.use('/', require('./routes/index'));

app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(port, (err) => console.log(err ? err?.message : `listening on ${port}`));

module.exports = app;
