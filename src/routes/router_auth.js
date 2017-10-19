const express = require('express');
const router = express.Router();
const app = new express();
const bodyParser = require('body-parser');
let User = require('../user.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

router.get('/login', (req, res, next) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
   if(req.body.email && req.body.pw){
       User.authenticate(req.body.email, req.body.pw, function (error, user) {
           if(error || !user) {
               let err = new Error('Wrong email or password');
               err.status = 401;
               return next(err);
           }
           req.session.userId = user._id;
           return res.redirect('/');
       });
   } else {
       let err = new Error('There was an error. All fields are required');
       err.status = 401;
       return next(err);
   }
});


router.get('/register', (req, res, next) => {
    res.render('register');
});

router.post('/register', (req, res, next) => {
    // check if all fields are filled
    if(req.body.email &&
        req.body.name &&
        req.body.pw &&
        req.body.pw2) {

        // confirm password
        if(req.body.pw !== req.body.pw2) {
            let err = new Error("There was an error. Passwords don't match");
            err.status = 400;
            return next(err);
        }

        let userData = {
            email : req.body.email,
            name: req.body.name,
            password: req.body.pw
        };

        User.create(userData, function (error, user) {
            if(error) return next(error);
            req.session.userId = user._id;
            return res.redirect('/');
        });
    } else {
        let err = new Error('There was an error. All fields are required');
        err.status = 400;
        return next(err);
    }
});

module.exports = router;