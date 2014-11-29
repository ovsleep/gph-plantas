var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');
var fs = require('fs');
var csv = require('fast-csv');
var multipart = require('connect-multiparty');
var excelParser = require('excel-parser');
var multipartMiddleware = multipart();

/*********** Orders **************/
router.get('/orders', function (req, res) {
    console.log(req);
    var db = req.db;
    db.collection('orders').find().toArray(function (err, items) {
        res.send(items);
    });
});

router.post('/orders/:_id', function (req, res) {
    var db = req.db;
    //TODO: Check if valid user
    db.collection('orders').update({ _id: mongo.helper.toObjectID(req.body._id) }, { '$set': { status: req.body.status } }, function (err, result) {
        if (err) throw err;
        if (result) console.log('Updated!');
    });


    //console.log(req.body);
});

router.delete('/orders/:id', function (req, res) {
    var db = req.db;
    //TODO: Check if valid user

    var orderToDelete = req.params.id;
    db.collection('orders').removeById(orderToDelete, function (err, result) {
        if (err) throw err;
        if (result) console.log('Deleted!');
    });
});


router.get('/orders/filter/:status', function (req, res) {
    var db = req.db;
    var status = req.params.status;
    var regex = new RegExp(["^", status, "$"].join(""), "i");

    db.collection('orders').find(
    		{ 'status': regex }
    	).toArray(function (err, items) {

    	    res.json(items);
    	});
});

/***********************************************/

/*********** Products **************/
router.get('/products/listado', function (req, res) {
    var db = req.db;
    db.collection('products').find().toArray(function (err, items) {
        res.json(items);
    });
});

router.get('/products/listado/:id', function (req, res) {
    var db = req.db;
    var prodId = req.params.id;
    db.collection('products').find(
            { 'id': prodId }
        ).toArray(function (err, items) {
            res.json(items);
        });
});

router.get('/products/listado/filtro/:type', function (req, res) {
    var db = req.db;
    var prodType = req.params.type;
    db.collection('products').find(
    		{ 'type': prodType }
    	).toArray(function (err, items) {

    	    res.json(items);
    	});
});

router.post('/products/multiload', multipartMiddleware, function (req, res) {
    console.log(req.files);
    console.log(req.files.file.path);
    var stream = fs.createReadStream(req.files.file.path);
    var db = req.db;
    var idx = 0;
    console.log('streamed');
    var csvStream = csv()
        .on("data", function (data) {
            console.log('updating product...')
            if (idx > 0) { //skips first column
                db.collection('products').update({
                    name: data[0]
                },
                {
                    '$set': {
                        name: data[0],
                        description: data[1],
                        price: data[2],
                        unit: data[3],
                    }
                }
                , { upsert: true }
                , function (err, result) {
                    if (err) throw err;
                    if (result) console.log('Updated!');
                });
            }
            idx++;
        })
        .on("end", function () {
            console.log("done");
        });

    stream.pipe(csvStream);
});


router.post('/products/:_id', function (req, res) {
    var db = req.db;
    db.collection('products').update({
        _id: mongo.helper.toObjectID(req.body._id)
    },
    {
        '$set': {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            unit: req.body.unit,
            unitSale: req.body.unitSale,
            unitWeight: req.body.unitWeight,
            type: req.body.type,
            active: req.body.active,
            image: req.body.image
        }
    }, function (err, result) {
        if (err) throw err;
        if (result) console.log('Updated!');
    });
});
/***********************************************/

module.exports = router;