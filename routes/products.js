var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');


router.get('/listado', function(req, res) {
    var db = req.db;
    db.collection('products').find({ active: true }).sort({ name: 1 }).toArray(function (err, items) {
        res.json(items);
    });
});

router.get('/listado/:id', function(req, res) {
    var db = req.db;
    var prodId = req.params.id;
    db.collection('products').find(
            { _id: mongo.helper.toObjectID(prodId) }
        ).toArray(function (err, items) {
            res.json(items[0]);
    });
});

router.get('/listado/filtro/:type', function(req, res) {
    var db = req.db;
    var prodType = req.params.type;
    db.collection('products').find(
    		{
    		    'type': prodType,
    		    'active': true
    		}
    	).sort({ name: 1 }).toArray(function (err, items) {
        
        res.json(items);
    });
});

module.exports = router;