var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');

var sendgrid = require("sendgrid")(process.env.SENDGRID_API);

//usuarios
router.post('/', function(req, res) {
    var db = req.db;
    //TODO: Check if valid user
    db.collection('orders').insert(req.body, function (err, result) {

        var email = new sendgrid.Email();
        email.addTo('ovsleep@gmail.com');
        email.addTo('phgabri@gmail.com');
        email.setFrom("ovsleep@gmail.com");
        email.setSubject("Nuevo pedido");
        email.setFromName('Puesto en Casa');

        var html = '<h3>Nuevo pedido</h3><table>'
        html = '<tr><td>Producto</td><td>Cantidad</td><td>Precio</td><td>Unidad</td><td>Comentarios</td></tr>'
        req.body.lines.forEach(function (prod) {
            html += '<tr>'
            html += '<td>' + prod.name + '</td>';
            html += '<td>' + prod.quantity + '</td>';
            html += '<td>' + prod.price + '</td>';
            html += '<td>' + prod.unit + '</td>';
            html += '<td>' + prod.comment + '</td>';
            html += '</tr>';
        })

        html += '</table>'
        html += '<br/> Comentarios: ' + req.body.user.comments;
        html += '<br/> Total: ' + req.body.totalPrice;
        html += '<br/> Para: <br>'
        html += '<ul>'
        html += '<li>' + req.body.user.name + '</li>'
        html += '<li>' + req.body.user.email + '</li>'
        html += '<li>' + req.body.user.phone + '</li>'
        html += '<li>' + req.body.user.address + '</li>'
        html += '</ul>'

        email.setHtml(html);

        sendgrid.send(email, function (err, json) {
            if (err) {
                console.error(err);
            }
            else {
                console.log('enviado: ' + guest.name);
                db.collection('guests').updateOne({ _id: guest._id }, { $set: { sent: true } });
            }
        });


        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.get('/:id', function (req, res) {
    var db = req.db;
    var orderId = req.params.id;
    db.collection('orders').find(
        { _id: mongo.helper.toObjectID(orderId) }
    ).toArray(function (err, items) {
        res.json(items[0]);
    });
});

router.get('/previous/:userId', function (req, res) {
    var db = req.db;
    var userId = req.params.userId;
    console.log(userId);
    db.collection('orders').find(
        { "user.id": userId.toString() }
    ).toArray(function (err, items) {
        res.json(items);
    });
});


module.exports = router;