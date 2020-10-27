import ZabbixService from '../../services/zabbix.service';

export class ZabbixController {

  login(req, res) {
    ZabbixService.login().then((r) => res.json(r));
  }

  logout(req, res) {
    ZabbixService.logout().then((r) => res.json(r));
  }

  get_hosts(req, res) {
    ZabbixService.get_hosts().then((r) => res.json(r));
  }

  create_map(req, res) {
    ZabbixService.create_map(req.body).then((r) => res.json(r));
  }


}
export default new ZabbixController();
