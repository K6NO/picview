const express = require('express');
const router = express.Router();
const app = new express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

router.get('/login', (req, res, next) => {
    res.render('login');
});

module.exports = router;