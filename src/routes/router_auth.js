const express = require('express');
const router = express.Router();
const app = new express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

router.get('/login', (req, res, next) => {
    res.render('login');
});


router.get('/register', (req, res, next) => {
    res.render('register');
});

router.post('/register', (req, res, next) => {
    res.send('post req. received');
});

module.exports = router;