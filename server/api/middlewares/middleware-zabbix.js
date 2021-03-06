import Zabbix from '../../../zabbix-rpc';

module.exports = async function log(req, res, next) {
  
  // if user tries to login multiple times from the same browser, only the same session is returned (if previous login attempt was successfull) 
  // if no session is in store, create new
  console.log("before session" +   req.session.user+" "+ req.session.host)
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
    await zabbix.user.logout()

    console.log(req.body.username+" "+req.body.url)
    
    if(!is_not_error){
      return res.status(404).send("Wrong login info. Log in again!!!");
    }

    if (is_not_error) {
      if (!req.session.host || !req.session.user || !req.session.pass) {
        req.session.host = req.body.url;
        req.session.user = req.body.username;
        req.session.pass = req.body.password;
      }
      console.log("session" +   req.session.user+" "+ req.session.host)

      var { host, user, pass } = req.session;

      if (!host || !user || !pass) {
        return res.status(500).send("Something in sessions broke.");
      }
    } 
  }

 next();
};
