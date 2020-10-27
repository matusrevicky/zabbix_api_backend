import l from '../../common/logger';

const Zabbix = require('zabbix-rpc');
const z = new Zabbix('127.0.0.1');

class ZabbixService {
  // all() {
  //   l.info(`${this.constructor.name}.all()`);
  //   return db.all();
  // }

  // byId(id) {
  //   l.info(`${this.constructor.name}.byId(${id})`);
  //   return db.byId(id);
  // }

  // create(name) {
  //   return db.insert(name);
  // }

  login() {
    l.info(`${this.constructor.name}.login()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    return z.user.login('Admin', 'zabbix').then((r) => z.user.check());
  }

  logout() {
    l.info(`${this.constructor.name}.logout()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    return z.user.logout();
  }

  get_hosts() {
    l.info(`${this.constructor.name}.get_hosts()`);
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    return z.host.get();
  }

  create_map(map) {
    return z.map.create(map);
  }

}

export default new ZabbixService();
