var plugin = function(options) {
    
    var seneca = this;

    seneca.add({ role: 'product', cmd: 'add' }, function (msg, respond) {
        this.make('product').data$(msg.data).save$(respond);
    });

    seneca.add({ role: 'product', cmd: 'get' }, function (msg, respond) {
        this.make('product').load$(msg.data.product_id, respond);
    });

    seneca.add({ role: 'product', cmd: 'get-all' }, function (msg, respond) {
        this.make('product').list$({}, respond);
    });

    seneca.add({ role: 'product', cmd: 'delete' }, function (msg, respond) {
        this.make('product').remove$(msg.data.product_id, respond);
    });
}

module.exports = plugin;

var seneca = require("seneca")();
seneca.use(plugin);
seneca.use('seneca-entity');

var postCounter = 0;
var getCounter = 0;
var deleteCounter = 0;

//Add product : POST request

seneca.add('role:api, cmd:add-product', function (args, done) {

    console.log("> products POST : (cmd:add-product)");

    var product =  {
        product_name: args.product_name,
        price: args.price,
        category: args.category
    }

    console.log("> Product Content : " + JSON.stringify(product));

    seneca.act({ role: 'product', cmd: 'add', data: product }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });

    postCounter++;

    console.log(`> Processed Request Count--> GET:${getCounter}, POST:${postCounter}, DELETE:${deleteCounter}`);

});

//Get all products : GET request

seneca.add('role:api, cmd:get-all-products', function (args, done) {

    console.log("> products GET : (cmd:get-all-product)");

    seneca.act({ role: 'product', cmd: 'get-all' }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });

    getCounter++;

    console.log(`> Processed Request Count--> GET:${getCounter}, POST:${postCounter}, DELETE:${deleteCounter}`);
});

//Get product by ID : GET request

seneca.add('role:api, cmd:get-product', function (args, done) {

    console.log("> products GET : (cmd:get-product) -> Product ID : " + args.product_id);

    seneca.act({ role: 'product', cmd: 'get', data: { product_id: args.product_id } }, function (err, msg) {
        console.log(msg);
        done(err, msg);
    });

    getCounter++;

    console.log(`> Processed Request Count--> GET:${getCounter}, POST:${postCounter}, DELETE:${deleteCounter}`);
});

//Delete product : DELETE Request

seneca.add('role:api, cmd:delete-product', function (args, done) {

    console.log("> products POST : (cmd:delete-product) -> Product ID : " + args.product_id);

    seneca.act({ role: 'product', cmd: 'delete', data: { product_id: args.product_id } }, function (err, msg) {
        console.log(msg);
        done(err, {message: "Product deleted successfully!"});
    });

    deleteCounter++;

    console.log(`> Processed Request Count--> GET:${getCounter}, POST:${postCounter}, DELETE:${deleteCounter}`);
});

//Delete all products : POST Request

seneca.add('role:api, cmd:delete-all-products', function (args, done) {

    console.log("> products GET : (cmd:delete-all-products)");

    seneca.act({ role: 'product', cmd: 'get-all' }, function (err, msg) {

        for (const item of msg) {

            seneca.act({ role: 'product', cmd: 'delete', data: { product_id: item.id } }, function (err, msg) { });

        }

        done(err, {message: "All products deleted successfully!"});

    });

    deleteCounter++;

    console.log(`> Processed Request Count--> GET:${getCounter}, POST:${postCounter}, DELETE:${deleteCounter}`);

});



//Initiation of server

seneca.act('role:web', {
    use: {
        prefix: '/product',
        pin: { role: 'api', cmd: '*' },
        map: {
            'add-product': { GET: true },
            'get-all-products': { GET: true },
            'get-product': { GET: true, },
            'delete-product': { GET: true, },
            'delete-all-products': { GET: true, }
        }
    }
})

var express = require('express');

var app = express();

app.use(require("body-parser").json());

app.use(seneca.export('web'));

//Web URI of server and connections

app.listen(3009, '127.0.0.1');

console.log("Server is listening at http://127.0.0.1:3009/");
console.log("----------------------------------------------");
console.log("http://127.0.0.1:3009/product/add-product?product_name=Airpods&price=$350.00&category=Audio");
console.log("http://127.0.0.1:3009/product/get-all-products");
console.log("http://127.0.0.1:3009/product/get-product?product_id=1245");
console.log("http://127.0.0.1:3009/product/delete-product?product_id=1245");
console.log("http://127.0.0.1:3009/product/delete-all-products");