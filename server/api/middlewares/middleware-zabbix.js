var Zabbix = require('zabbix-rpc');
var zabbixes = require("../services/object-zabbixes");

module.exports = async function log(req, res, next) {
  if( !req.session.host || !req.session.user || !req.session.pass ) {
    req.session.host = req.body.url;
    req.session.user = req.body.username;
    req.session.pass = req.body.password;
  }
  
    var { host, user, pass }  = req.session;
  
    if( !host || !user || !pass ) {
      return res.status(500).send("Something broke.");
    }
  
    if( !zabbixes[req.session.id] ) {
      //eventhou documentation clearly states: var Zabbix: new (host?: string, user?: string, pass?: string) => Zabbix
      // it is impossible to create new zabbix like that
      var zabbix =  await new Zabbix(host);
      await zabbix.user.login(user, pass);
      zabbixes[req.session.id] = await zabbix;
      // var zzz = shopifys[req.session.id]
      // // var zz = await new Zabbix('127.0.0.1', 'Admin', 'zabbix');
      // var result = await zzz.user.check();
      // console.log(await result);
    }

    return next();
  };
  