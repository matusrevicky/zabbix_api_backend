const express = require('express');
var app = express();
const Zabbix = require('zabbix-rpc')
const z = new Zabbix('127.0.0.1');

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

// how to create trigger map https://www.zabbix.com/documentation/4.4/manual/api/reference/map/create
app.get('/map',  async function (req, res) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    map = await z.map.create({
        "name": "Map",
        "width": 600,
        "height": 600
    });
    res.send(map);
})


var server = app.listen(8088, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

