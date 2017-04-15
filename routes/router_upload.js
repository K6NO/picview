const express = require('express');
const router = express.Router();
const multer = require('multer');
const app = new express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

router.get('/upload', (req, res, next) => {
    res.render('upload');
});

var upload = multer({
    dest: 'public/img/upload'
});

router.post('/', upload.array('image'), (req, res, next) => {
    console.log(req.files);

    console.log(req.body);
    res.send(req.body);
});

module.exports = router;