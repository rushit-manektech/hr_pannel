const fs = require('fs'),
  path = require('path'),
  logger = require('morgan'),
  moment = require('moment'),
  express = require('express'),
  flash = require('connect-flash'),
  session = require('express-session'),
  createError = require('http-errors'),
  cookieParser = require('cookie-parser'),
  fileUpload = require('express-fileupload');

const pro = require('./google/production');
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
app.use(fileUpload());

app.use('/', require('./routes/index'));
app.use('/resumes', express.static('resumes'));

setInterval(function () {
  let dirPath = __dirname + './resumes';
  fs.readdir(dirPath, function (readdirError, files) {
    files.forEach(function (file) {
      fs.stat(path.join(dirPath, file), function (statError, stat) {
        if (statError) return console.error(statError?.message);
        const now = new Date().getTime();
        const endTime = new Date(stat.ctime).getTime() + 604800000; // 7 days old
        if (now > endTime) {
          return fs.unlink(path.join(dirPath, file), function (unLinkError) {
            if (unLinkError) return console.error(unLinkError?.message);
            console.log('successfully deleted');
          });
        }
      });
    });
  });
}, 24 * 60 * 60 * 1000); // every 24 hours

app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(port, (err) => console.log(err ? err?.message : `listening on ${port}`));

module.exports = app;
