const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    session = require('express-session');

const app = express();
const indexRouter = require('./routes/router_index.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// bodyParser and cookieParser middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mongo session store
const MongoStore = require('connect-mongo')(session);

// MongoDB config
let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kepnezegeto';
let options = { promiseLibrary: require('bluebird') };

mongoose.connect(mongoUri, options);
const db = mongoose.connection;

let port = process.env.PORT || 3000;

db.on('error', console.error.bind(console, 'connection error'));

// Session config for Mongo
let sessionOptions = {
    secret: 'This is the secret pass phrase',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore ({
        mongooseConnection: db
    })
};

app.use(session(sessionOptions));


app.use('/', indexRouter);

// Error handlers
// 404
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// development error handler / will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        error : err
    });
});

app.listen(port, function(){
    console.log('Express server is running on port 3000');
});