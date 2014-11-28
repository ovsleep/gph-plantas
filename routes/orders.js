var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');

//usuarios
router.post('/', function(req, res) {
    var db = req.db;
    //TODO: Check if valid user
    db.collection('orders').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});


module.exports = router;