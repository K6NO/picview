const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const indexRouter = require('../routes/router_index.js');

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, '..', 'public')));


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

app.listen(3000, function(){
    console.log('Express server is running on port 3000');
});