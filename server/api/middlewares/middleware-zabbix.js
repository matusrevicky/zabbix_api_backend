var Zabbix = require('zabbix-rpc');
var zabbixes = require("../services/object-zabbixes");

module.exports = async function log(req, res, next) {
  // if user tries to login multiple times from the same browser, only the same session is returned (if previous login attempts was successfull) 
  // if no session is in store, create new and map zabbix instance
  // if session in store is destroyed(every session gets destroyed after time), create new and map zabbix instance (possible problem: previous mapping remains after some time mapping dictionary is too big)

  
  if (!req.session.host || !req.session.user || !req.session.pass) {
    // TODO Do not use in production!!!!!
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    var zabbix = await new Zabbix(req.body.url);
    await zabbix.user.login(req.body.username, req.body.password);
    var is_not_error = await zabbix.user.check().then(data => {
      if (data.error == undefined)
        return true;
      return false;
    });

    // console.log(is_not_error)
    if (is_not_error) {
      if (!req.session.host || !req.session.user || !req.session.pass) {
        req.session.host = req.body.url;
        req.session.user = req.body.username;
        req.session.pass = req.body.password;

      }

      var { host, user, pass } = req.session;

      if (!host || !user || !pass) {
        return res.status(500).send("Something broke.");
      }

      zabbixes[req.session.id] = await zabbix;
    } else {
      return res.status(500).send("Wrong login info. Log in again!!!");
    }

  }

 // if session is in store, but not in dictionary (Can happen if app is restarted) (problem: session is defined, but mapping isnt)
 // solved here
  try {
    await zabbixes[req.session.id].user.check();
  } catch (error) {
    // TODO Do not use in production!!!!!
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    var zabbix = await new Zabbix(req.body.url);
    await zabbix.user.login(req.body.username, req.body.password);
    var is_not_error = await zabbix.user.check().then(data => {
      if (data.error == undefined)
        return true;
      return false;
    });

    // console.log(is_not_error)
    if (is_not_error) {
      if (!req.session.host || !req.session.user || !req.session.pass) {
        req.session.host = req.body.url;
        req.session.user = req.body.username;
        req.session.pass = req.body.password;

      }

      var { host, user, pass } = req.session;

      if (!host || !user || !pass) {
        return res.status(500).send("Something broke.");
      }

      zabbixes[req.session.id] = await zabbix;
    } else {
      return res.status(500).send("Wrong login info. Log in again!!!");
    }

  }

  return next();

};
