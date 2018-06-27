let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let middleware = require('./utils/middleware');
let fs = require('fs');
let twig = require('twig');


let indexRouter = require('./routes/index');
let adminRouter = require('./routes/admin');

let app = express();

app.use(session({
    secret: "MPFocBeQCseqmxIQ6bF6KNNH68ARqor7qs9wixIm8Caq6Q2lpjfxIrCPjM6P3k90rlUin3nS4lk3ArTkEfYqimk9AfamcHU5mqVu",
    resave: false,
    saveUninitialized: true,
    cookie: {path: '/', secure: false}
}));

app.engine('twig',  (filePath, options, callback) => {
    twig.extendFilter('json_decode', (value, params) => {
        params = params || [];
        try {
            value = JSON.parse(value);
        } catch (e) {
            throw new twig.Error(e)
        }
        return value;
    });
    return twig.renderFile(filePath,options,callback);
});

// view engine setup
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
    if (process.env.env === 'dev') {
        res.locals.info = "!!! RUNNING ON TESTNET!!!"
    }
    next();
})

app.use('/', indexRouter);
app.use('/admin', middleware.processSC2User, adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if(err.status && err.status !== 404) {
      console.error(err)
  }

  // render the error page
  res.status(err.status || 500);
  if (fs.existsSync(__dirname + '/views/error/'+err.status+'.twig')) {
      res.render('error/'+err.status);
  } else {
      res.render('error/500');
  }

});

module.exports = app;
