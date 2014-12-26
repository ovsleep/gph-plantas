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

router.post('/orders/export', function (req, res) {
    var db = req.db;
    orders = req.body;
    orders = orders.map(function (id) { return mongo.helper.toObjectID(id) });
    console.log(orders);
    db.collection('orders').find({ _id: { $in: orders } }).toArray(function (err, items) {
        var transformed = [];
        var allNames = items.map(function (order) { return order.user.name });
        items.forEach(function (item) {
            var name = item.user.name;
            item.lines.forEach(function (prod) {
                var line = transformed.filter(function (elem) {
                    return elem.Producto == prod.name;
                })[0];
                var newLine = false;
                if (!line) {
                    line = {};
                    line.Producto = prod.name;
                    allNames.forEach(function (name) { line[name] = '' });
                    newLine = true;
                }
                
                if (line[name] != '') {
                    line[name] += ' | ';
                }

                line[name] += prod.quantity + ' ' + prod.unit;
                if (newLine) {
                    transformed.push(line);
                }
            })
        })
        console.log(transformed);
        csv
           .writeToStream(res, transformed, { headers: true });
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

router.post('/products/listado', function (req, res) {
    console.log('listado post');
    var db = req.db;
    req.body.forEach(function (product) {
        console.log('updating: ' + product._id);
        var id = mongo.helper.toObjectID(product._id);
        delete product._id;
        db.collection('products').update({
            _id: id
        },
        product,
        function (err, result) {
            if (err) throw err;
            if (result) {
                console.log('Updated!')
                res.json({ message: 'Updated!' });
            };
        });
    });
});

router.post('/products/multiload', multipartMiddleware, function (req, res) {
    console.log('ok');
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
                        unit: data[3]
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

router.post('/products/listado/:_id', function (req, res) {
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
        if (result) {
            console.log('Updated!')
            res.json({ message: 'Updated!' });
        };
    });
});

router.delete('/products/listado/:id', function (req, res) {
    var db = req.db;
    //TODO: Check if valid user
    console.log(req.params);
    var productToDelete = req.params.id;
    console.log('deleting: ' + productToDelete)
    db.collection('products').removeById(productToDelete, function (err, result) {
        if (err) throw err;
        if (result) console.log('Deleted!');
    });
});
/***********************************************/

module.exports = router;