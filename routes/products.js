var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');
var fs = require('fs');
var csv = require('fast-csv');
var multipart = require('connect-multiparty');
var excelParser = require('excel-parser');

//multipart middleware to parse uploaded files
var multipartMiddleware = multipart();

/*
 * GET userlist.
 */
router.get('/listado', function(req, res) {
    var db = req.db;
    db.collection('products').find().toArray(function (err, items) {
        res.json(items);
    });
});


router.get('/listado/:id', function(req, res) {
    var db = req.db;
    var prodId = req.params.id;
    db.collection('products').find(
            { 'id': prodId }
        ).toArray(function (err, items) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.json(items);
    });
});

router.get('/listado/filtro/:type', function(req, res) {
    var db = req.db;
    var prodType = req.params.type;
    db.collection('products').find(
    		{ 'type': prodType }
    	).toArray(function (err, items) {
        
        res.json(items);
    });
});

//admin
router.post('/multiload', multipartMiddleware, function (req, res) {
    console.log('path:' + req.files.file.path);
    var stream = fs.createReadStream(req.files.file.path);
    var db = req.db;
    var idx = 0;
    var csvStream = csv()
        .on("data", function (data) {
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
                        //image: '/images/' + data[0].replace(/[^a-zA-Z0-9]/g,'_') + '.png'
                        //type: req.body.type,
                        //active: req.body.active
                    }
                }
                ,{ upsert: true }
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


router.post('/:_id', function (req, res) {
    var db = req.db;
    //TODO: Check if valid user
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


    //console.log(req.body);
});

module.exports = router;