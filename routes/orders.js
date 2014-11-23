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


//admin
router.get('/', function(req, res) {
    var db = req.db;
    db.collection('orders').find().toArray(function (err, items) {
        res.send(items);
    });
});

router.post('/:_id', function (req, res) {
    var db = req.db;
    //TODO: Check if valid user
    db.collection('orders').update({ _id: mongo.helper.toObjectID(req.body._id) }, { '$set': { status: req.body.status } }, function (err, result) {
        if (err) throw err;
        if (result) console.log('Updated!');
    });


    //console.log(req.body);
});

router.delete('/:id', function (req, res) {
    var db = req.db;
    //TODO: Check if valid user

    var orderToDelete = req.params.id;
    db.collection('orders').removeById(orderToDelete, function (err, result) {
        if (err) throw err;
        if (result) console.log('Deleted!');
    });
});


router.get('/filter/:status', function (req, res) {
    var db = req.db;
    var status = req.params.status;
    var regex = new RegExp(["^", status, "$"].join(""), "i");

    db.collection('orders').find(
    		{ 'status': regex }
    	).toArray(function (err, items) {

    	    res.json(items);
    	});
});
module.exports = router;