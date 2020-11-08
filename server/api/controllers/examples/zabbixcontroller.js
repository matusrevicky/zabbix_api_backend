import ZabbixService from '../../services/zabbix.service';

export class ZabbixController {

  login(req, res) {
    ZabbixService.login(req).then((r) => res.json(r));
  }

  logout(req, res) {
    ZabbixService.logout().then((r) => res.json(r));
  }

  get_hosts(req, res) {
    ZabbixService.get_hosts(req).then((r) => res.json(r));
  }

  create_maps(req, res) {
    ZabbixService.create_maps(req).then((r) => res.json(r));
  }

}
export default new ZabbixController();
