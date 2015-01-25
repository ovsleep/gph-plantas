var express = require('express');
var router = express.Router();
var mongo = require('mongoskin');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_PASS
    }
});


//usuarios
router.post('/', function(req, res) {
    var db = req.db;
    //TODO: Check if valid user
    db.collection('orders').insert(req.body, function (err, result) {
        var mail = {
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_TO,
            subject: 'Nuevo pedido',
        }

        mail.html = '<h3>Nuevo pedido</h3><table>'
        mail.html = '<tr><td>Producto</td><td>Cantidad</td><td>Precio</td><td>Unidad</td><td>Comentarios</td></tr>'
        req.body.lines.forEach(function (prod) {
            mail.html += '<tr>'
            mail.html += '<td>' + prod.name + '</td>';
            mail.html += '<td>' + prod.quantity + '</td>';
            mail.html += '<td>' + prod.price + '</td>';
            mail.html += '<td>' + prod.unit + '</td>';
            mail.html += '<td>' + prod.comment + '</td>';
            mail.html += '</tr>';
        })

        mail.html += '</table>'
        mail.html += '<br/> Comentarios: ' + req.body.user.comments;
        mail.html += '<br/> Total: ' + req.body.totalPrice;
        mail.html += '<br/> Para: <br>'
        mail.html += '<ul>'
        mail.html += '<li>' + req.body.user.name +'</li>'
        mail.html += '<li>' + req.body.user.email + '</li>'
        mail.html += '<li>' + req.body.user.phone + '</li>'
        mail.html += '<li>' + req.body.user.address + '</li>'
        mail.html += '</ul>'

        console.log(mail);

        transporter.sendMail(mail);

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
        res.json(items);
    });
});

router.get('/previous/:userId', function (req, res) {
    var db = req.db;
    var userId = req.params.userId;
    db.collection('orders').find(
        { 'user.id': userId }
    ).toArray(function (err, items) {
        res.json(items);
    });
});


module.exports = router;