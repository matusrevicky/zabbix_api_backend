const express = require('express');
var app = express();
const Zabbix = require('zabbix-rpc')
const z = new Zabbix('127.0.0.1');

// body parser no longer shipped with express for more info http://expressjs.com/en/resources/middleware/body-parser.html
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json({ extended: true })
//app.use(bodyParser.json({ type: 'application/*+json' }))
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


/**
 * Login
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/login', async function (req, res) {
    user = await z.user.login('Admin', 'zabbix');
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    check = await z.user.check();
    res.send(check);
})

/**
 * Logout
 * @function logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/logout', async function (req, res) {
    let logout = await z.user.logout();
    res.send(logout);
})

/**
 * Host
 * @function get_host
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/host',  async function (req, res) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    host = await z.host.get();
    res.send(host);
})


app.post('/map', jsonParser,  async function(req, res) {
    sample = await req.body;
    // console.log('Got body:', sample);
    map = await z.map.create(sample);
    res.send(map);
});

// how to create trigger map https://www.zabbix.com/documentation/4.4/manual/api/reference/map/create
// just a testing sample
app.get('/map',  async function (req, res) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    type = {
        "name": "TEST4 Trigger map",
        "width": 600,
        "height": 600,
        "selements": [
            {
                "elements": [
                    {"triggerid": "16199"}
                ],
                "label": "1",
                "label_location": "0",
                "elementtype": 2,
                "iconid_off": "2",
                "iconid_disabled": "2",
                "iconid_maintenance": "2",
                "iconid_on": "2",
                "x": 50,
                "y": 150
            },
            {
                "elements": [
                    {"triggerid": "13467"}
                ],
                "label" : "2",
                "label_location": "3",
                "elementtype": 2,
                "iconid_off": "2",
                "iconid_disabled": "2",
                "iconid_maintenance": "2",
                "iconid_on": "2",
                "x": 100,
                "y": 150
            },
        ]
    }
    console.log(typeof type);
    map = await z.map.create(type);
    res.send(map);
})


var server = app.listen(8088, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

