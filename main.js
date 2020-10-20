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


var server = app.listen(8088, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})

